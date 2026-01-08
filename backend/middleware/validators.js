const { body, param, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');
const { VALIDATION } = require('../config/constants');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => {
      const errorObj = {
        field: err.path,
        message: err.msg
      };
      
      if (!['password', 'passwordHash', 'token', 'refreshToken'].includes(err.path)) {
        errorObj.value = err.value;
      }
      
      return errorObj;
    });
    
    throw new AppError(
      'Validace vstupních dat selhala',
      400,
      errorMessages
    );
  }
  
  next();
};

const validateRegister = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Neplatná emailová adresa')
    .normalizeEmail()
    .isLength({ max: VALIDATION.EMAIL.MAX_LENGTH })
    .withMessage('Email je příliš dlouhý'),
  
  body('password')
    .isLength({ min: VALIDATION.PASSWORD.MIN_LENGTH, max: VALIDATION.PASSWORD.MAX_LENGTH })
    .withMessage('Heslo musí mít 6-128 znaků')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .withMessage('Heslo musí obsahovat alespoň jedno písmeno a číslo'),
  
  body('password')
    .custom((value) => {
      const lowerValue = value.toLowerCase();
      if (VALIDATION.PASSWORD.COMMON_PASSWORDS.includes(lowerValue)) {
        throw new Error('Heslo je příliš běžné a snadno uhádnutelné');
      }
      return true;
    }),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Jméno je povinné')
    .isLength({ min: VALIDATION.NAME.MIN_LENGTH, max: VALIDATION.NAME.MAX_LENGTH })
    .withMessage('Jméno musí mít 2-100 znaků')
    .matches(/^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s]+$/)
    .withMessage('Jméno může obsahovat pouze písmena'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Neplatná emailová adresa')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Heslo je povinné'),
  
  handleValidationErrors
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Jméno musí mít 2-100 znaků')
    .matches(/^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s]+$/)
    .withMessage('Jméno může obsahovat pouze písmena'),
  
  handleValidationErrors
];

const validateCompleteLesson = [
  body('topicId')
    .isInt({ min: 1 })
    .withMessage('Neplatné ID tématu'),
  
  body('lessonId')
    .isInt({ min: 1 })
    .withMessage('Neplatné ID lekce'),
  
  handleValidationErrors
];

const validateSaveQuizResult = [
  body('topicId')
    .isInt({ min: 1 })
    .withMessage('Neplatné ID tématu'),
  
  body('score')
    .isObject()
    .withMessage('Score musí být objekt'),
  
  body('score.correct')
    .isInt({ min: 0 })
    .withMessage('Počet správných odpovědí musí být číslo'),
  
  body('score.total')
    .isInt({ min: 1 })
    .withMessage('Celkový počet otázek musí být kladné číslo'),
  
  body('percentage')
    .isInt({ min: 0, max: 100 })
    .withMessage('Procenta musí být mezi 0 a 100'),
  
  handleValidationErrors
];

const validateTopicId = [
  param('topicId')
    .isInt({ min: 1 })
    .withMessage('Neplatné ID tématu'),
  
  handleValidationErrors
];

const validateQuizSubmit = [
  body('topicId')
    .isInt({ min: 1 })
    .withMessage('Neplatné ID tématu'),
  
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Odpovědi musí být neprázdné pole'),
  
  body('answers.*')
    .isInt({ min: 0 })
    .withMessage('Každá odpověď musí být číslo'),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateCompleteLesson,
  validateSaveQuizResult,
  validateTopicId,
  validateQuizSubmit,
  handleValidationErrors
};
