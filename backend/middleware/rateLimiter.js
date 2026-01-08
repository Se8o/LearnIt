const rateLimit = require('express-rate-limit');
const { AppError } = require('./errorHandler');

const skipRateLimiting = process.env.NODE_ENV === 'test';
const isProdEnv = process.env.NODE_ENV === 'production';
const disableRegisterLimiter =
  !isProdEnv || process.env.DISABLE_REGISTER_RATE_LIMIT === 'true';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Příliš mnoho požadavků z této IP adresy, zkuste to prosím později',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => skipRateLimiting,
  handler: (req, res) => {
    throw new AppError(
      'Příliš mnoho požadavků. Zkuste to prosím za chvíli.',
      429
    );
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  skip: () => skipRateLimiting,
  message: 'Příliš mnoho pokusů o přihlášení, zkuste to za 15 minut',
  handler: (req, res) => {
    throw new AppError(
      'Příliš mnoho pokusů o přihlášení. Zkuste to prosím za 15 minut.',
      429
    );
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: disableRegisterLimiter ? 5000 : 3,
  skip: () => skipRateLimiting || disableRegisterLimiter,
  message: 'Příliš mnoho registrací z této IP adresy',
  handler: (req, res) => {
    throw new AppError(
      'Příliš mnoho registrací z této IP adresy. Zkuste to prosím později.',
      429
    );
  }
});

const quizLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  skip: () => skipRateLimiting,
  message: 'Příliš mnoho odeslaných kvízů',
  handler: (req, res) => {
    throw new AppError(
      'Prosím, zpomalte. Můžete odesílat maximum 10 kvízů za minutu.',
      429
    );
  }
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  skip: () => skipRateLimiting,
  message: 'Příliš mnoho pokusů, zkuste to později',
  handler: (req, res) => {
    throw new AppError(
      'Příliš mnoho pokusů. Zkuste to prosím za 15 minut.',
      429
    );
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  registerLimiter,
  quizLimiter,
  strictLimiter
};
