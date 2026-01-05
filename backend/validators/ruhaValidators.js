const { body, param, query } = require('express-validator');

const createRuhaValidator = [
  body('Cikkszam')
    .notEmpty()
    .withMessage('Cikkszám megadása kötelező')
    .trim(),
  body('Fajta')
    .notEmpty()
    .withMessage('Fajta megadása kötelező')
    .trim(),
  body('Szin')
    .notEmpty()
    .withMessage('Szín megadása kötelező')
    .trim(),
  body('Meret')
    .notEmpty()
    .withMessage('Méret megadása kötelező')
    .trim(),
  body('Mennyiseg')
    .notEmpty()
    .withMessage('Mennyiség megadása kötelező')
    .isInt({ min: 0 })
    .withMessage('A mennyiség nem lehet negatív'),
  body('Minoseg')
    .optional()
    .isIn(['Uj', 'Jo', 'Szakadt'])
    .withMessage('Érvénytelen minőség')
];

const updateRuhaValidator = [
  param('ruhaId')
    .isInt()
    .withMessage('Érvénytelen ruhacikk azonosító'),
  body('Cikkszam')
    .optional()
    .trim(),
  body('Fajta')
    .optional()
    .trim(),
  body('Szin')
    .optional()
    .trim(),
  body('Meret')
    .optional()
    .trim(),
  body('Mennyiseg')
    .optional()
    .isInt({ min: 0 })
    .withMessage('A mennyiség nem lehet negatív'),
  body('Minoseg')
    .optional()
    .isIn(['Uj', 'Jo', 'Szakadt'])
    .withMessage('Érvénytelen minőség')
];

const ruhaIdValidator = [
  param('ruhaId')
    .isInt()
    .withMessage('Érvénytelen ruhacikk azonosító')
];

const searchValidator = [
  query('q')
    .notEmpty()
    .withMessage('Keresési kifejezés megadása kötelező')
    .trim()
];

const cikkszamValidator = [
  param('cikkszam')
    .notEmpty()
    .withMessage('Cikkszám megadása kötelező')
    .trim()
];

module.exports = {
  createRuhaValidator,
  updateRuhaValidator,
  ruhaIdValidator,
  searchValidator,
  cikkszamValidator
};

