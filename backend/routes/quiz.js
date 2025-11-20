const express = require('express');
const router = express.Router();
const quizzes = require('../data/quizzes');
const topics = require('../data/topics');

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
router.get('/:topicId', (req, res) => {
  try {
    const topicId = parseInt(req.params.topicId);
    
    // Zkontrolovat, zda téma existuje
    const topic = topics.find(t => t.id === topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Téma nenalezeno'
      });
    }
    
    // Najít kvíz pro toto téma
    const quiz = quizzes.find(q => q.topicId === topicId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Kvíz pro toto téma nebyl nalezen'
      });
    }
    
    // Odstranit správné odpovědi z otázek (poslat pouze pro kontrolu)
    const quizForUser = {
      ...quiz,
      questions: quiz.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options
        // correctAnswer a explanation nejsou zahrnuty
      }))
    };
    
    res.json({
      success: true,
      data: {
        ...quizForUser,
        topic: topic
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání kvízu'
    });
  }
});

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
router.post('/submit', (req, res) => {
  try {
    const { topicId, answers } = req.body;
    
    if (!topicId || !answers) {
      return res.status(400).json({
        success: false,
        error: 'Chybí topicId nebo odpovědi'
      });
    }
    
    const quiz = quizzes.find(q => q.topicId === parseInt(topicId));
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Kvíz nenalezen'
      });
    }
    
    // Vyhodnotit odpovědi
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
    
    const correctCount = results.filter(r => r.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    // Určit úroveň úspěchu
    let feedback = '';
    let level = '';
    
    if (percentage >= 90) {
      feedback = 'Výborně! Máš tématu opravdu rozumíš! 🌟';
      level = 'excellent';
    } else if (percentage >= 70) {
      feedback = 'Dobrá práce! Pár věcí bys mohl/a ještě zopakovat. 👍';
      level = 'good';
    } else if (percentage >= 50) {
      feedback = 'Není to špatné, ale doporučuji si lekci zopakovat. 📚';
      level = 'average';
    } else {
      feedback = 'Zkus si lekci projít znovu a pak to zkus ještě jednou. 💪';
      level = 'needs-improvement';
    }
    
    res.json({
      success: true,
      data: {
        results: results,
        score: {
          correct: correctCount,
          total: totalQuestions,
          percentage: percentage
        },
        feedback: feedback,
        level: level
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Chyba při vyhodnocování kvízu'
    });
  }
});

module.exports = router;
