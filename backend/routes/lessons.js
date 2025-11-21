const express = require('express');
const router = express.Router();
const { getAllLessons, getLessonByTopicId } = require('../db/models/lessons');
const { getTopicById } = require('../db/models/topics');
const { successResponse } = require('../utils/response-helpers');

/**
 * @swagger
 * components:
 *   schemas:
 *     Lesson:
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
 *           example: Newtonovy zákony pohybu
 *         content:
 *           type: string
 *           description: Markdown formátovaný obsah lekce
 *         videoUrl:
 *           type: string
 *           example: https://www.youtube.com/embed/kKKM8Y-u7ds
 *         videoTitle:
 *           type: string
 *           example: Newtonovy zákony jednoduše vysvětlené
 *         estimatedTime:
 *           type: integer
 *           example: 5
 *         keyPoints:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Zákon setrvačnosti", "F = m × a"]
 */

/**
 * @swagger
 * /api/lessons/{topicId}:
 *   get:
 *     summary: Získat lekci pro dané téma
 *     tags: [Lessons]
 *     description: Vrátí kompletní lekci včetně obsahu, videa a klíčových bodů
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
 *         description: Detail lekce
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Lesson'
 *                     - type: object
 *                       properties:
 *                         topic:
 *                           $ref: '#/components/schemas/Topic'
 *       404:
 *         description: Téma nebo lekce nenalezena
 *       500:
 *         description: Chyba serveru
 */
router.get('/:topicId', (req, res) => {
  try {
    const topicId = parseInt(req.params.topicId);
    
    const topic = getTopicById(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Téma nenalezeno'
      });
    }
    
    const lesson = getLessonByTopicId(topicId);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lekce pro toto téma nebyla nalezena'
      });
    }
    
    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání lekce'
    });
  }
});

/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Získat všechny lekce
 *     tags: [Lessons]
 *     description: Vrátí seznam všech dostupných lekcí s informacemi o tématech
 *     responses:
 *       200:
 *         description: Seznam všech lekcí
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lesson'
 *       500:
 *         description: Chyba serveru
 */
router.get('/', (req, res) => {
  try {
    const lessonsWithTopics = getAllLessons();
    
    res.json({
      success: true,
      count: lessonsWithTopics.length,
      data: lessonsWithTopics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání lekcí'
    });
  }
});

module.exports = router;
