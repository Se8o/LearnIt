const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { seedDatabase } = require('./db/seed');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const { deleteExpiredTokens } = require('./db/models/refreshTokens');

// Load environment variables FIRST
dotenv.config();

// Import config after dotenv
const { validateEnv, config } = require('./config/env');
const { logger, httpLogger } = require('./config/logger');

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  logger.error('Environment validation failed:', error.message);
  process.exit(1);
}

seedDatabase();

// Cleanup expired refresh tokens on startup
deleteExpiredTokens();
logger.info('Expired refresh tokens cleaned up');

// Setup periodic cleanup (every 24 hours)
setInterval(() => {
  const result = deleteExpiredTokens();
  logger.info('Periodic cleanup of expired tokens', { deleted: result.changes });
}, 24 * 60 * 60 * 1000);

const app = express();

// Security middleware - správné pořadí je kritické!
app.set('trust proxy', 1); // Pro správné IP adresy za reverse proxy

// 1. Helmet - Security HTTP headers (XSS, clickjacking, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Pro Swagger UI
}));

// 2. CORS konfigurace
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));

// 3. Rate limiting - před parsing pro ochranu před DoS
app.use('/api', generalLimiter);

// 4. Body parsing - po rate limitingu
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Data sanitization proti NoSQL injection a XSS
app.use(mongoSanitize()); // Odstraní $ a . z user input
app.use(xss()); // Sanitizuje user input proti XSS

// HTTP request logging
app.use(httpLogger);

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
