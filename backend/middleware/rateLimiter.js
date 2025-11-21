const rateLimit = require('express-rate-limit');
const { AppError } = require('./errorHandler');

/**
 * Obecný rate limiter - pro většinu endpointů
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // limit 100 requestů per windowMs
  message: 'Příliš mnoho požadavků z této IP adresy, zkuste to prosím později',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    throw new AppError(
      'Příliš mnoho požadavků. Zkuste to prosím za chvíli.',
      429
    );
  }
});

/**
 * Přísný rate limiter pro autentizační endpointy
 * Chrání proti brute-force útokům na přihlášení
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 5, // limit 5 pokusů o přihlášení
  skipSuccessfulRequests: true, // Nepočítat úspěšné pokusy
  message: 'Příliš mnoho pokusů o přihlášení, zkuste to za 15 minut',
  handler: (req, res) => {
    throw new AppError(
      'Příliš mnoho pokusů o přihlášení. Zkuste to prosím za 15 minut.',
      429
    );
  }
});

/**
 * Rate limiter pro registraci
 * Omezuje spam registrace
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hodina
  max: 3, // max 3 registrace za hodinu z jedné IP
  message: 'Příliš mnoho registrací z této IP adresy',
  handler: (req, res) => {
    throw new AppError(
      'Příliš mnoho registrací z této IP adresy. Zkuste to prosím později.',
      429
    );
  }
});

/**
 * Rate limiter pro kvízy
 * Omezuje možnost submitovat příliš rychle
 */
const quizLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuta
  max: 10, // max 10 submitů za minutu
  message: 'Příliš mnoho odeslaných kvízů',
  handler: (req, res) => {
    throw new AppError(
      'Prosím, zpomalte. Můžete odesílat maximum 10 kvízů za minutu.',
      429
    );
  }
});

/**
 * Strict limiter pro sensitive operace
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 3, // max 3 pokusy
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
