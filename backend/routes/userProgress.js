const express = require('express');
const router = express.Router();
const { getUserProgress, completeLesson, saveQuizResult, resetProgress } = require('../db/models/userProgress');
const { optionalAuth, authenticateToken } = require('../middleware/auth');
const { validateCompleteLesson, validateSaveQuizResult } = require('../middleware/validators');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProgress:
 *       type: object
 *       properties:
 *         completedLessons:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               topicId:
 *                 type: integer
 *               lessonId:
 *                 type: integer
 *               completedAt:
 *                 type: string
 *                 format: date-time
 *         quizResults:
 *           type: array
 *           items:
 *             type: object
 *         totalPoints:
 *           type: integer
 *           example: 150
 *         level:
 *           type: integer
 *           example: 2
 *         badges:
 *           type: array
 *           items:
 *             type: string
 *           example: ["perfect-score", "beginner"]
 *     CompleteLessonRequest:
 *       type: object
 *       required:
 *         - topicId
 *         - lessonId
 *       properties:
 *         topicId:
 *           type: integer
 *           example: 1
 *         lessonId:
 *           type: integer
 *           example: 1
 *     SaveQuizResultRequest:
 *       type: object
 *       required:
 *         - topicId
 *         - score
 *         - percentage
 *       properties:
 *         topicId:
 *           type: integer
 *           example: 1
 *         score:
 *           type: object
 *           properties:
 *             correct:
 *               type: integer
 *             total:
 *               type: integer
 *         percentage:
 *           type: integer
 *           example: 75
 */

/**
 * @swagger
 * /api/user-progress:
 *   get:
 *     summary: Získat pokrok uživatele
 *     tags: [User Progress]
 *     description: Vrátí kompletní informace o pokroku - dokončené lekce, výsledky kvízů, body, úroveň a odznaky
 *     responses:
 *       200:
 *         description: Pokrok uživatele
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserProgress'
 *       500:
 *         description: Chyba serveru
 */
router.get('/', optionalAuth, asyncHandler((req, res) => {
  // Pro nepřihlášené uživatele vrátit prázdný progress
  if (!req.user) {
    return res.json({
      success: true,
      data: {
        completedLessons: [],
        quizResults: [],
        totalPoints: 0,
        level: 1,
        badges: []
      }
    });
  }
  
  const userId = req.user.userId;
  const progress = getUserProgress(userId);
  res.json({
    success: true,
    data: progress
  });
}));

/**
 * @swagger
 * /api/user-progress/complete-lesson:
 *   post:
 *     summary: Označit lekci jako dokončenou
 *     tags: [User Progress]
 *     description: Přidá lekci do seznamu dokončených a přidělí body
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteLessonRequest'
 *     responses:
 *       200:
 *         description: Lekce označena jako dokončená
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserProgress'
 *       400:
 *         description: Chybí požadovaná data
 *       500:
 *         description: Chyba serveru
 */
router.post('/complete-lesson', optionalAuth, validateCompleteLesson, asyncHandler((req, res) => {
  // Vyžadovat přihlášení pro uložení pokroku
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Pro uložení pokroku se musíte přihlásit'
    });
  }
  
  const { topicId, lessonId } = req.body;
  const userId = req.user.userId;
  const progress = completeLesson(userId, topicId, lessonId);
  
  res.json({
    success: true,
    data: progress
  });
}));

/**
 * @swagger
 * /api/user-progress/save-quiz-result:
 *   post:
 *     summary: Uložit výsledek kvízu
 *     tags: [User Progress]
 *     description: Uloží výsledek kvízu, přidělí body a případně odznaky
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaveQuizResultRequest'
 *     responses:
 *       200:
 *         description: Výsledek kvízu uložen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserProgress'
 *                 pointsEarned:
 *                   type: integer
 *                   example: 8
 *       400:
 *         description: Chybí požadovaná data
 *       500:
 *         description: Chyba serveru
 */
router.post('/save-quiz-result', optionalAuth, validateSaveQuizResult, asyncHandler((req, res) => {
  // Vyžadovat přihlášení pro uložení výsledků kvízu
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Pro uložení výsledků se musíte přihlásit'
    });
  }
  
  const { topicId, score, percentage } = req.body;
  const userId = req.user.userId;
  const result = saveQuizResult(userId, topicId, score, percentage);
  
  res.json({
    success: true,
    data: result.progress,
    pointsEarned: result.pointsEarned
  });
}));

/**
 * @swagger
 * /api/user-progress/reset:
 *   post:
 *     summary: Resetovat pokrok uživatele
 *     tags: [User Progress]
 *     description: Vymaže veškerý pokrok (pouze pro testování)
 *     responses:
 *       200:
 *         description: Pokrok byl resetován
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Pokrok byl resetován
 *                 data:
 *                   $ref: '#/components/schemas/UserProgress'
 *       500:
 *         description: Chyba serveru
 */
router.post('/reset', optionalAuth, asyncHandler((req, res) => {
  // Vyžadovat přihlášení pro reset pokroku
  if (!req.user) {
    throw new AppError('Pro reset pokroku se musíte přihlásit', 401);
  }
  
  const userId = req.user.userId;
  const progress = resetProgress(userId);
  
  res.json({
    success: true,
    message: 'Pokrok byl resetován',
    data: progress
  });
}));

module.exports = router;
