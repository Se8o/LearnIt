const request = require('supertest');
const express = require('express');
const quizRoutes = require('../../routes/quiz');
const { errorHandler } = require('../../middleware/errorHandler');

describe('Quiz API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/quiz', quizRoutes);
    app.use(errorHandler);
  });

  describe('GET /api/quiz/:topicId', () => {
    test('should get quiz for valid topic', async () => {
      const response = await request(app)
        .get('/api/quiz/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.topicId).toBe(1);
      expect(response.body.data.questions).toBeInstanceOf(Array);
      expect(response.body.data.questions.length).toBeGreaterThan(0);
    });

    test('should return 404 for non-existent topic', async () => {
      const response = await request(app)
        .get('/api/quiz/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should validate topic ID is numeric', async () => {
      const response = await request(app)
        .get('/api/quiz/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should include all question fields', async () => {
      const response = await request(app)
        .get('/api/quiz/1')
        .expect(200);

      const question = response.body.data.questions[0];
      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('question');
      expect(question).toHaveProperty('options');
      expect(question.options).toBeInstanceOf(Array);
      expect(question.options.length).toBe(4);
    });
  });

  describe('POST /api/quiz/submit', () => {
    test('should submit quiz and get results', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .send({
          topicId: 1,
          answers: [0, 1, 2, 0, 1]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('results');
      expect(response.body.data).toHaveProperty('score');
      expect(response.body.data.score).toHaveProperty('correct');
      expect(response.body.data.score).toHaveProperty('total');
      expect(response.body.data.score).toHaveProperty('percentage');
      expect(response.body.data).toHaveProperty('feedback');
      expect(response.body.data).toHaveProperty('level');
    });

    test('should validate results format', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .send({
          topicId: 1,
          answers: [0, 1, 2, 0, 1]
        })
        .expect(200);

      const result = response.body.data.results[0];
      expect(result).toHaveProperty('questionId');
      expect(result).toHaveProperty('question');
      expect(result).toHaveProperty('userAnswer');
      expect(result).toHaveProperty('correctAnswer');
      expect(result).toHaveProperty('isCorrect');
      expect(result).toHaveProperty('explanation');
    });

    test('should calculate score correctly', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .send({
          topicId: 1,
          answers: [0, 0, 0, 0, 0] // All same answer
        })
        .expect(200);

      const { score } = response.body.data;
      expect(score.correct).toBeLessThanOrEqual(score.total);
      expect(score.percentage).toBe((score.correct / score.total) * 100);
    });

    test('should provide appropriate feedback based on score', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .send({
          topicId: 1,
          answers: [0, 1, 2, 0, 1]
        })
        .expect(200);

      const { feedback, level, score } = response.body.data;
      
      expect(feedback).toBeDefined();
      expect(level).toBeDefined();
      
      // Level should be one of the expected values
      if (score.percentage >= 90) {
        expect(level).toBe('excellent');
      } else if (score.percentage >= 70) {
        expect(level).toBe('good');
      } else if (score.percentage >= 50) {
        expect(level).toBe('average');
      } else {
        expect(level).toBe('needs-improvement');
      }
    });

    test('should reject missing topicId', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .send({
          answers: [0, 1, 2]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject missing answers', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .send({
          topicId: 1
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject invalid answers format', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .send({
          topicId: 1,
          answers: 'not-an-array'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject non-numeric answers', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .send({
          topicId: 1,
          answers: ['a', 'b', 'c']
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject invalid topic ID', async () => {
      const response = await request(app)
        .post('/api/quiz/submit')
        .send({
          topicId: 99999,
          answers: [0, 1, 2]
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
