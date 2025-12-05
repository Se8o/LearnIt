const express = require('express');
const router = express.Router();
const { getAllTopics, getTopicById, getTopicsByCategory } = require('../db/models/topics');
const { successResponse } = require('../utils/response-helpers');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * @swagger
 * components:
 *   schemas:
 *     Topic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Fyzika - Newtonovy zákony pohybu
 *         category:
 *           type: string
 *           example: Fyzika
 *         description:
 *           type: string
 *           example: Základy klasické mechaniky a pohybu těles
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           example: beginner
 *         duration:
 *           type: integer
 *           description: Odhadovaná délka v minutách
 *           example: 5
 *         icon:
 *           type: string
 *           example: ⚛️
 *         color:
 *           type: string
 *           example: "#3B82F6"
 */

/**
 * @swagger
 * /api/topics:
 *   get:
 *     summary: Získat všechna témata
 *     tags: [Topics]
 *     description: Vrátí seznam všech dostupných vzdělávacích témat
 *     responses:
 *       200:
 *         description: Seznam témat úspěšně načten
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Topic'
 *       500:
 *         description: Chyba serveru
 */
router.get('/', asyncHandler((req, res) => {
  const topics = getAllTopics();
  res.json({
    success: true,
    count: topics.length,
    data: topics
  });
}));

/**
 * @swagger
 * /api/topics/{id}:
 *   get:
 *     summary: Získat konkrétní téma
 *     tags: [Topics]
 *     description: Vrátí detail konkrétního tématu podle ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID tématu
 *         example: 1
 *     responses:
 *       200:
 *         description: Detail tématu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Topic'
 *       404:
 *         description: Téma nenalezeno
 *       500:
 *         description: Chyba serveru
 */
router.get('/:id', asyncHandler((req, res) => {
  const topicId = parseInt(req.params.id);
  const topic = getTopicById(topicId);
  
  if (!topic) {
    throw new AppError('Téma nenalezeno', 404);
  }
  
  res.json({
    success: true,
    data: topic
  });
}));

/**
 * @swagger
 * /api/topics/category/{category}:
 *   get:
 *     summary: Získat témata podle kategorie
 *     tags: [Topics]
 *     description: Vrátí témata filtrovaná podle kategorie
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Název kategorie
 *         example: Fyzika
 *     responses:
 *       200:
 *         description: Seznam témat podle kategorie
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
 *                     $ref: '#/components/schemas/Topic'
 *       500:
 *         description: Chyba serveru
 */
router.get('/category/:category', asyncHandler((req, res) => {
  const category = req.params.category;
  const filteredTopics = getTopicsByCategory(category);
  
  res.json({
    success: true,
    count: filteredTopics.length,
    data: filteredTopics
  });
}));

module.exports = router;
