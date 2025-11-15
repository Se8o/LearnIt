/**
 * Environment variables configuration a validace
 */

// NOTE: Logger se importuje až po načtení .env, takže při validaci musíme použít console
// Pro runtime warnings používáme logger (viz níže)
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
  // NOTE: Používáme console zde, protože logger ještě není inicializován
  // Pro production warnings viz getConfigWarnings() níže
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
 * Vrátí pole warnings pro runtime logging
 */
const getConfigWarnings = () => {
  const warnings = [];
  
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long');
  }
  
  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    warnings.push('JWT_REFRESH_SECRET should be at least 32 characters long');
  }
  
  return warnings;
};

/**
 * Parse time string (e.g., '15m', '7d', '2h') to days
 * @param {string} timeStr - Time string with unit (m/h/d)
 * @param {number} defaultDays - Default value if parsing fails
 * @returns {number} Number of days
 */
const parseTimeToDays = (timeStr, defaultDays = 7) => {
  if (!timeStr) return defaultDays;
  
  const match = timeStr.match(/^(\d+)([mhd])$/);
  if (!match) return defaultDays;
  
  const [, value, unit] = match;
  const numValue = parseInt(value, 10);
  
  switch (unit) {
    case 'm': // minutes to days
      return numValue / (60 * 24);
    case 'h': // hours to days
      return numValue / 24;
    case 'd': // days
      return numValue;
    default:
      return defaultDays;
  }
};

/**
 * Export konfigurační objekt
 */
const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    // Parsed values
    refreshTokenExpiryDays: parseTimeToDays(process.env.REFRESH_TOKEN_EXPIRY, 7)
  },
  
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim())
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  security: {
    bcryptRounds: 10,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15 minut
  }
};

module.exports = {
  validateEnv,
  config,
  getConfigWarnings
};
