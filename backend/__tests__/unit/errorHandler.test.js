const { AppError, errorHandler, asyncHandler } = require('../../middleware/errorHandler');

describe('AppError Class', () => {
  test('should create error with status code and message', () => {
    const error = new AppError('Test error', 400);
    
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
  });

  test('should create error with errors array', () => {
    const errors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Password too short' }
    ];
    const error = new AppError('Validation failed', 400, errors);
    
    expect(error.errors).toEqual(errors);
  });

  test('should default to operational error', () => {
    const error = new AppError('Test', 500);
    expect(error.isOperational).toBe(true);
  });

  test('should capture stack trace', () => {
    const error = new AppError('Test', 500);
    expect(error.stack).toBeDefined();
  });
});

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  test('should handle AppError correctly', () => {
    const error = new AppError('Test error', 400);
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Test error',
      })
    );
  });

  test('should handle AppError with errors array', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const errors = [{ field: 'email', message: 'Invalid' }];
    const error = new AppError('Validation failed', 400, errors);
    
    errorHandler(error, req, res, next);
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Validation failed',
        errors: errors,
      })
    );
    
    process.env.NODE_ENV = originalEnv;
  });

  test('should handle generic errors with 500 status', () => {
    const error = new Error('Something went wrong');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Something went wrong',
      })
    );
  });

  test('should include stack trace in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const error = new Error('Test');
    
    errorHandler(error, req, res, next);
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.any(String),
      })
    );
    
    process.env.NODE_ENV = originalEnv;
  });

  test('should not include stack trace in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const error = new Error('Test');
    
    errorHandler(error, req, res, next);
    
    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.stack).toBeUndefined();
    
    process.env.NODE_ENV = originalEnv;
  });
});

describe('AsyncHandler Wrapper', () => {
  test('should call next with error if async function throws', async () => {
    const error = new Error('Async error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(asyncFn);
    
    const req = {};
    const res = {};
    const next = jest.fn();
    
    await wrapped(req, res, next);
    
    expect(next).toHaveBeenCalledWith(error);
  });

  test('should not call next if async function succeeds', async () => {
    const asyncFn = jest.fn().mockResolvedValue('success');
    const wrapped = asyncHandler(asyncFn);
    
    const req = {};
    const res = {};
    const next = jest.fn();
    
    await wrapped(req, res, next);
    
    expect(next).not.toHaveBeenCalled();
    expect(asyncFn).toHaveBeenCalledWith(req, res, next);
  });
});
