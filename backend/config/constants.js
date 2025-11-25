/**
 * Application constants
 * Centralized configuration for magic numbers and hardcoded values
 */

// Validation constraints
const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    COMMON_PASSWORDS: ['password', '12345678', 'qwerty123', 'password123', 'admin123']
  },
  EMAIL: {
    MAX_LENGTH: 255
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  }
};

// Gamification settings
const GAMIFICATION = {
  POINTS_PER_LEVEL: 100,
  PERFECT_SCORE: 100,
  STREAK: {
    WEEK_WARRIOR_DAYS: 7,
    MONTH_MASTER_DAYS: 30
  }
};

// Token settings
const TOKENS = {
  REFRESH_TOKEN_DEFAULT_EXPIRY_DAYS: 7
};

module.exports = {
  VALIDATION,
  GAMIFICATION,
  TOKENS
};
