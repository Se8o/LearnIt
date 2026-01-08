class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: err.stack,
      errors: error.errors
    });
  } else {
    console.error('Error:', {
      message: error.message,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method
    });
  }

  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    error.message = 'Tento email je již zaregistrován';
    error.statusCode = 409;
  }

  if (err.name === 'JsonWebTokenError') {
    error.message = 'Neplatný autentizační token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Platnost tokenu vypršela, přihlašte se znovu';
    error.statusCode = 401;
  }

  if (err.name === 'ValidationError') {
    error.message = 'Neplatná data';
    error.statusCode = 400;
  }

  const response = {
    success: false,
    error: error.message || 'Něco se pokazilo',
    statusCode: error.statusCode
  };

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    if (err.stack) {
      response.stack = err.stack;
    }
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
