/**
 * Environment variables configuration a validace
 */

const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const optionalEnvVars = {
  PORT: '3001',
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  CORS_ORIGIN: 'http://localhost:3000'
};

/**
 * Validace povinných environment variables
 */
const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file.'
    );
  }
  
  // Nastavit defaultní hodnoty pro optional vars
  Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  });
  
  // Validace formátů
  if (process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  Warning: JWT_SECRET should be at least 32 characters long');
  }
  
  if (process.env.JWT_REFRESH_SECRET.length < 32) {
    console.warn('⚠️  Warning: JWT_REFRESH_SECRET should be at least 32 characters long');
  }
  
  const validNodeEnvs = ['development', 'production', 'test'];
  if (!validNodeEnvs.includes(process.env.NODE_ENV)) {
    console.warn(`⚠️  Warning: NODE_ENV should be one of: ${validNodeEnvs.join(', ')}`);
  }
};

/**
 * Export konfigurační objekt
 */
const config = {
  port: parseInt(process.env.PORT, 10),
  nodeEnv: process.env.NODE_ENV,
  
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY
  },
  
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim())
  },
  
  logging: {
    level: process.env.LOG_LEVEL
  },
  
  security: {
    bcryptRounds: 10,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15 minut
  }
};

module.exports = {
  validateEnv,
  config
};
