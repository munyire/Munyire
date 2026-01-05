const { body, param } = require('express-validator');

const updateDolgozoValidator = [
  param('dolgozoId')
    .isInt()
    .withMessage('Érvénytelen dolgozó azonosító'),
  body('Email')
    .optional()
    .isEmail()
    .withMessage('Érvényes email cím megadása kötelező')
    .normalizeEmail(),
  body('Telefonszam')
    .optional()
    .trim(),
  body('Szerepkor')
    .optional()
    .isIn(['Dolgozo', 'Manager', 'Admin'])
    .withMessage('Érvénytelen szerepkör')
];

const dolgozoIdValidator = [
  param('dolgozoId')
    .isInt()
    .withMessage('Érvénytelen dolgozó azonosító')
];

module.exports = {
  updateDolgozoValidator,
  dolgozoIdValidator
};

