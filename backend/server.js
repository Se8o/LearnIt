const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { seedDatabase } = require('./db/seed');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Load environment variables FIRST
dotenv.config();

// Import config after dotenv
const { validateEnv, config } = require('./config/env');
const { logger, httpLogger } = require('./config/logger');

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

seedDatabase();

const app = express();

// Security middleware
app.set('trust proxy', 1); // Pro správné IP adresy za reverse proxy

// CORS konfigurace
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(httpLogger);

// Rate limiting - aplikuj na všechny API routes
app.use('/api', generalLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'LearnIt API Docs',
}));

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

const topicsRouter = require('./routes/topics');
const lessonsRouter = require('./routes/lessons');
const quizRouter = require('./routes/quiz');
const userProgressRouter = require('./routes/userProgress');
const authRouter = require('./routes/auth');

app.use('/api/topics', topicsRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/user-progress', userProgressRouter);
app.use('/api/auth', authRouter);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Ověří, že API server běží správně
 *     responses:
 *       200:
 *         description: Server běží v pořádku
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: LearnIt API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LearnIt API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler - musí být před error handlerem
app.use(notFound);

// Globální error handler - musí být poslední middleware
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`LearnIt Backend running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`API Documentation: http://localhost:${config.port}/api-docs`);
  logger.info(`Health check: http://localhost:${config.port}/api/health`);
  logger.info(`Log level: ${config.logging.level}`);
});
