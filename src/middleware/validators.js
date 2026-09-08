const { body } = require('express-validator');

const passwordRules = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
  .matches(/\d/).withMessage('Password must contain at least one number')
  .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character');

exports.registerValidation = [
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  passwordRules,
  body('role').optional().isIn(['client', 'freelancer', 'admin']).withMessage('Invalid role')
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];
