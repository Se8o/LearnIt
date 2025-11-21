const { createTables, getDb } = require('./setup');
const { logger } = require('../config/logger');
const topicsData = require('../data/topics');
const lessonsData = require('../data/lessons');
const quizzesData = require('../data/quizzes');

const seedDatabase = () => {
  logger.info('Starting database seeding...');
  
  createTables();
  
  const db = getDb();
  
  const existingTopics = db.prepare('SELECT COUNT(*) as count FROM topics').get();
  if (existingTopics.count > 0) {
    logger.info('Database already seeded. Skipping...');
    return;
  }
  
  logger.info('Seeding topics...');
  const topicStmt = db.prepare(`
    INSERT INTO topics (id, title, category, description, difficulty, duration, icon, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const topic of topicsData) {
    topicStmt.run(
      topic.id,
      topic.title,
      topic.category,
      topic.description,
      topic.difficulty,
      topic.duration,
      topic.icon || '',
      topic.color
    );
  }
  logger.info(`Seeded ${topicsData.length} topics`);
  
  logger.info('Seeding lessons...');
  const lessonStmt = db.prepare(`
    INSERT INTO lessons (id, topic_id, title, content, video_url, video_title, estimated_time, key_points)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const lesson of lessonsData) {
    lessonStmt.run(
      lesson.id,
      lesson.topicId,
      lesson.title,
      lesson.content,
      lesson.videoUrl,
      lesson.videoTitle,
      lesson.estimatedTime,
      JSON.stringify(lesson.keyPoints)
    );
  }
  logger.info(`Seeded ${lessonsData.length} lessons`);
  
  logger.info('Seeding quizzes...');
  for (const quiz of quizzesData) {
    const quizResult = db.prepare(`
      INSERT INTO quizzes (id, topic_id, title)
      VALUES (?, ?, ?)
    `).run(quiz.id, quiz.topicId, quiz.title);
    
    const quizId = quiz.id;
    
    const questionStmt = db.prepare(`
      INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, explanation)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    for (const question of quiz.questions) {
      questionStmt.run(
        quizId,
        question.question,
        JSON.stringify(question.options),
        question.correctAnswer,
        question.explanation
      );
    }
  }
  logger.info(`Seeded ${quizzesData.length} quizzes`);
  
  logger.info('Database seeding completed successfully!');
};

if (require.main === module) {
  seedDatabase();
  process.exit(0);
}

module.exports = { seedDatabase };
