const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  }
};

winston.addColors(customLevels.colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { 
    service: 'learnit-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
  exitOnError: false,
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

logger.exceptions.handle(
  new winston.transports.File({ 
    filename: path.join(__dirname, '../logs/exceptions.log'),
    maxsize: 5242880,
    maxFiles: 5,
  })
);

logger.rejections.handle(
  new winston.transports.File({ 
    filename: path.join(__dirname, '../logs/rejections.log'),
    maxsize: 5242880,
    maxFiles: 5,
  })
);

const httpLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  });
  
  next();
};

const logWithContext = (level, message, context = {}) => {
  logger.log(level, message, context);
};

module.exports = {
  logger,
  httpLogger,
  logWithContext
};
