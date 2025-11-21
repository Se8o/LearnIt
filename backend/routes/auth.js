const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmail, getUserById, validatePassword, updateUser } = require('../db/models/users');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { validateRegister, validateLogin, validateUpdateProfile } = require('../middleware/validators');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { logger } = require('../config/logger');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           example: user@example.com
 *         name:
 *           type: string
 *           example: Jan Novák
 *         createdAt:
 *           type: string
 *           format: date-time
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: heslo123
 *         name:
 *           type: string
 *           example: Jan Novák
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: heslo123
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrace nového uživatele
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Uživatel úspěšně vytvořen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Chybějící data nebo email již existuje
 */
router.post('/register', registerLimiter, validateRegister, asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  logger.info('Registration attempt', { email, name });

  const user = await createUser(email, password, name);

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  logger.info('User registered successfully', { userId: user.id, email });

  res.status(201).json({
    success: true,
    message: 'Uživatel úspěšně vytvořen',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
}));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Přihlášení uživatele
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Úspěšné přihlášení
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Neplatné přihlašovací údaje
 */
router.post('/login', authLimiter, validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  logger.info('Login attempt', { email });

  const user = getUserByEmail(email);

  if (!user) {
    logger.warn('Login failed - user not found', { email });
    throw new AppError('Neplatný email nebo heslo', 401);
  }

  const isValidPassword = await validatePassword(password, user.passwordHash);

  if (!isValidPassword) {
    logger.warn('Login failed - invalid password', { email, userId: user.id });
    throw new AppError('Neplatný email nebo heslo', 401);
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  logger.info('User logged in successfully', { userId: user.id, email });

  res.json({
    success: true,
    message: 'Úspěšně přihlášen',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
}));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Získat informace o aktuálně přihlášeném uživateli
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informace o uživateli
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Nepřihlášen
 */
router.get('/me', authenticateToken, asyncHandler((req, res) => {
  const user = getUserById(req.user.userId);

  if (!user) {
    throw new AppError('Uživatel nenalezen', 404);
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }
  });
}));

/**
 * @swagger
 * /api/auth/update-profile:
 *   put:
 *     summary: Aktualizovat profil uživatele
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jan Novák
 *     responses:
 *       200:
 *         description: Profil aktualizován
 *       401:
 *         description: Nepřihlášen
 */
router.put('/update-profile', authenticateToken, validateUpdateProfile, asyncHandler((req, res) => {
  const { name } = req.body;

  const updatedUser = updateUser(req.user.userId, { name });

  logger.info('User profile updated', { userId: req.user.userId });

  res.json({
    success: true,
    message: 'Profil aktualizován',
    user: updatedUser
  });
}));

module.exports = router;
