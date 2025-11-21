/**
 * Custom Error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // Odlišuje operační chyby od programátorských chyb
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralizovaný error handler middleware
 * Musí být poslední middleware v řetězci
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error pro debugging (v produkci by šlo do loggeru jako Winston)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: err.stack,
      errors: error.errors
    });
  } else {
    // V produkci logovat jen kritické info (později přidat Winston)
    console.error('Error:', {
      message: error.message,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method
    });
  }

  // SQLite constraint error (např. unique email)
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    error.message = 'Tento email je již zaregistrován';
    error.statusCode = 409;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Neplatný autentizační token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Platnost tokenu vypršela, přihlašte se znovu';
    error.statusCode = 401;
  }

  // Validation errors (později pro express-validator)
  if (err.name === 'ValidationError') {
    error.message = 'Neplatná data';
    error.statusCode = 400;
  }

  // Response struktura
  const response = {
    success: false,
    error: error.message || 'Něco se pokazilo',
    statusCode: error.statusCode
  };

  // Přidat detaily jen v development mode
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    if (error.errors) {
      response.errors = error.errors;
    }
  }

  res.status(error.statusCode).json(response);
};

/**
 * Handler pro neexistující routes (404)
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Endpoint ${req.originalUrl} nebyl nalezen`, 404);
  next(error);
};

/**
 * Async handler wrapper - eliminuje potřebu try-catch v každém route handleru
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  asyncHandler
};
