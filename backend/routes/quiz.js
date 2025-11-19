const express = require('express');
const router = express.Router();
const { getQuizByTopicId } = require('../db/models/quizzes');
const { getTopicById } = require('../db/models/topics');
const { validateTopicId, validateQuizSubmit } = require('../middleware/validators');
const { quizLimiter } = require('../middleware/rateLimiter');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { successResponse, getQuizFeedback, calculateQuizScore } = require('../utils/response-helpers');

/**
 * @swagger
 * components:
 *   schemas:
 *     QuizQuestion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         question:
 *           type: string
 *           example: Co říká první Newtonův zákon?
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Odpověď A", "Odpověď B", "Odpověď C", "Odpověď D"]
 *     Quiz:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         topicId:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Test znalostí - Newtonovy zákony
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuizQuestion'
 *     QuizSubmission:
 *       type: object
 *       required:
 *         - topicId
 *         - answers
 *       properties:
 *         topicId:
 *           type: integer
 *           example: 1
 *         answers:
 *           type: array
 *           items:
 *             type: integer
 *           example: [0, 2, 2, 2]
 *           description: Array indexů odpovědí (0-3)
 */

/**
 * @swagger
 * /api/quiz/{topicId}:
 *   get:
 *     summary: Získat kvíz pro dané téma
 *     tags: [Quiz]
 *     description: Vrátí kvíz s otázkami (bez správných odpovědí)
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID tématu
 *         example: 1
 *     responses:
 *       200:
 *         description: Kvíz pro téma
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Quiz'
 *                     - type: object
 *                       properties:
 *                         topic:
 *                           $ref: '#/components/schemas/Topic'
 *       404:
 *         description: Téma nebo kvíz nenalezen
 *       500:
 *         description: Chyba serveru
 */
router.get('/:topicId', validateTopicId, asyncHandler((req, res) => {
  const topicId = parseInt(req.params.topicId);
  
  const topic = getTopicById(topicId);
  if (!topic) {
    throw new AppError('Téma nenalezeno', 404);
  }
  
  const quiz = getQuizByTopicId(topicId);
  
  if (!quiz) {
    throw new AppError('Kvíz pro toto téma nebyl nalezen', 404);
  }
  
  const quizForUser = {
    ...quiz,
    questions: quiz.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options
    }))
  };
  
  res.json({
    success: true,
    data: quizForUser
  });
}));

/**
 * @swagger
 * /api/quiz/submit:
 *   post:
 *     summary: Odeslat odpovědi a získat vyhodnocení
 *     tags: [Quiz]
 *     description: Odešle odpovědi na kvíz a vrátí detailní vyhodnocení s bodovým skóre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizSubmission'
 *           example:
 *             topicId: 1
 *             answers: [0, 2, 2, 2]
 *     responses:
 *       200:
 *         description: Vyhodnocení kvízu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           questionId:
 *                             type: integer
 *                           question:
 *                             type: string
 *                           userAnswer:
 *                             type: integer
 *                           correctAnswer:
 *                             type: integer
 *                           isCorrect:
 *                             type: boolean
 *                           explanation:
 *                             type: string
 *                     score:
 *                       type: object
 *                       properties:
 *                         correct:
 *                           type: integer
 *                           example: 3
 *                         total:
 *                           type: integer
 *                           example: 4
 *                         percentage:
 *                           type: integer
 *                           example: 75
 *                     feedback:
 *                       type: string
 *                       example: Dobrá práce! Pár věcí bys mohl/a ještě zopakovat. 👍
 *                     level:
 *                       type: string
 *                       enum: [excellent, good, average, needs-improvement]
 *                       example: good
 *       400:
 *         description: Chybí požadovaná data
 *       404:
 *         description: Kvíz nenalezen
 *       500:
 *         description: Chyba serveru
 */
router.post('/submit', quizLimiter, validateQuizSubmit, asyncHandler((req, res) => {
  const { topicId, answers } = req.body;
  
  const quiz = getQuizByTopicId(parseInt(topicId));
  
  if (!quiz) {
    throw new AppError('Kvíz nenalezen', 404);
  }
  
  const results = quiz.questions.map((question, index) => {
    const userAnswer = answers[index];
    const isCorrect = userAnswer === question.correctAnswer;
    
    return {
      questionId: question.id,
      question: question.question,
      userAnswer: userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: isCorrect,
      explanation: question.explanation
    };
  });
  
  const score = calculateQuizScore(results);
  const { feedback, level } = getQuizFeedback(score.percentage);
  
  res.json({
    success: true,
    data: {
      results,
      score,
      feedback,
      level
    }
  });
}));

module.exports = router;
