const { body } = require('express-validator');

const loginValidator = [
  body('FelhasznaloNev')
    .notEmpty()
    .withMessage('Felhasználónév megadása kötelező')
    .trim(),
  body('Jelszo')
    .notEmpty()
    .withMessage('Jelszó megadása kötelező')
    .isLength({ min: 3 })
    .withMessage('A jelszó minimum 3 karakter hosszú kell legyen')
];

const registerValidator = [
  body('DNev')
    .notEmpty()
    .withMessage('Név megadása kötelező')
    .trim()
    .isLength({ min: 2 })
    .withMessage('A név minimum 2 karakter hosszú kell legyen'),
  body('Email')
    .notEmpty()
    .withMessage('Email megadása kötelező')
    .isEmail()
    .withMessage('Érvényes email cím megadása kötelező')
    .normalizeEmail(),
  body('Telefonszam')
    .optional()
    .trim(),
  body('Nem')
    .optional()
    .trim(),
  body('Munkakor')
    .optional()
    .trim(),
  body('Szerepkor')
    .notEmpty()
    .withMessage('Szerepkör megadása kötelező')
    .isIn(['Dolgozo', 'Manager', 'Admin'])
    .withMessage('Érvénytelen szerepkör'),
  body('FelhasznaloNev')
    .notEmpty()
    .withMessage('Felhasználónév megadása kötelező')
    .trim()
    .isLength({ min: 3 })
    .withMessage('A felhasználónév minimum 3 karakter hosszú kell legyen'),
  body('Jelszo')
    .notEmpty()
    .withMessage('Jelszó megadása kötelező')
    .isLength({ min: 3 })
    .withMessage('A jelszó minimum 3 karakter hosszú kell legyen')
];

module.exports = {
  loginValidator,
  registerValidator
};

