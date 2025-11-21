const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ujistit se, že logs složka existuje
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Definice custom log levelů
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

// Přidat barvy do winston
winston.addColors(customLevels.colors);

// Format pro konzoli (barevný, čitelný)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Format pro soubory (JSON pro snadné parsování)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Vytvoření loggeru
const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { 
    service: 'learnit-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error log - pouze chyby
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined log - všechno
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  
  // Neukončovat process při neošetřené výjimce
  exitOnError: false,
});

// V development módu loguj i do konzole
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Zachytávání neošetřených výjimek a rejection
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

/**
 * HTTP request logging middleware
 */
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

/**
 * Helper funkce pro logování s kontextem
 */
const logWithContext = (level, message, context = {}) => {
  logger.log(level, message, context);
};

module.exports = {
  logger,
  httpLogger,
  logWithContext
};
