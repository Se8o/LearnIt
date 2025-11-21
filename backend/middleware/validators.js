const { body, param, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

/**
 * Middleware pro zpracování výsledků validace
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));
    
    throw new AppError(
      'Validace vstupních dat selhala',
      400,
      errorMessages
    );
  }
  
  next();
};

/**
 * Validace pro registraci
 */
const validateRegister = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Neplatná emailová adresa')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email je příliš dlouhý'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Heslo musí mít alespoň 6 znaků')
    .isLength({ max: 128 })
    .withMessage('Heslo je příliš dlouhé')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Heslo musí obsahovat malé písmeno, velké písmeno a číslo'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Jméno je povinné')
    .isLength({ min: 2, max: 100 })
    .withMessage('Jméno musí mít 2-100 znaků')
    .matches(/^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s]+$/)
    .withMessage('Jméno může obsahovat pouze písmena'),
  
  handleValidationErrors
];

/**
 * Validace pro přihlášení
 */
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

/**
 * Validace pro aktualizaci profilu
 */
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

/**
 * Validace pro dokončení lekce
 */
const validateCompleteLesson = [
  body('topicId')
    .isInt({ min: 1 })
    .withMessage('Neplatné ID tématu'),
  
  body('lessonId')
    .isInt({ min: 1 })
    .withMessage('Neplatné ID lekce'),
  
  handleValidationErrors
];

/**
 * Validace pro uložení výsledku kvízu
 */
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

/**
 * Validace pro ID parametr v URL
 */
const validateTopicId = [
  param('topicId')
    .isInt({ min: 1 })
    .withMessage('Neplatné ID tématu'),
  
  handleValidationErrors
];

/**
 * Validace pro submit kvízu
 */
const validateQuizSubmit = [
  param('topicId')
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
