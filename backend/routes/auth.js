const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmail, getUserById, validatePassword, updateUser } = require('../db/models/users');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

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
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, heslo a jméno jsou povinné'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Heslo musí mít alespoň 6 znaků'
      });
    }

    const user = await createUser(email, password, name);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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
  } catch (error) {
    if (error.message === 'Email již existuje') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Chyba při vytváření uživatele'
    });
  }
});

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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email a heslo jsou povinné'
      });
    }

    const user = getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Neplatný email nebo heslo'
      });
    }

    const isValidPassword = await validatePassword(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Neplatný email nebo heslo'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Chyba při přihlašování'
    });
  }
});

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
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Uživatel nenalezen'
      });
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání uživatele'
    });
  }
});

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
router.put('/update-profile', authenticateToken, (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Jméno je povinné'
      });
    }

    const updatedUser = updateUser(req.user.userId, { name });

    res.json({
      success: true,
      message: 'Profil aktualizován',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Chyba při aktualizaci profilu'
    });
  }
});

module.exports = router;
