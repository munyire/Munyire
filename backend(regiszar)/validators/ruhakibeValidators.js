const { body, param, query } = require('express-validator');

const createKiadásValidator = [
  body('DolgozoID')
    .notEmpty()
    .withMessage('Dolgozó azonosító megadása kötelező')
    .isInt()
    .withMessage('Érvénytelen dolgozó azonosító'),
  body('RuhaID')
    .notEmpty()
    .withMessage('Ruhacikk azonosító megadása kötelező')
    .isInt()
    .withMessage('Érvénytelen ruhacikk azonosító'),
  body('KiadasDatum')
    .optional()
    .isISO8601()
    .withMessage('Érvénytelen dátum formátum'),
  body('Mennyiseg')
    .notEmpty()
    .withMessage('Mennyiség megadása kötelező')
    .isInt({ min: 1 })
    .withMessage('A mennyiség pozitív egész szám kell legyen'),
  body('Indok')
    .notEmpty()
    .withMessage('Indok megadása kötelező')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Az indok minimum 3 karakter hosszú kell legyen')
];

const visszavetelValidator = [
  param('ruhaKiBeId')
    .isInt()
    .withMessage('Érvénytelen tranzakció azonosító'),
  body('VisszaDatum')
    .optional()
    .isISO8601()
    .withMessage('Érvénytelen dátum formátum'),
  body('RuhaMinoseg')
    .optional()
    .isIn(['Uj', 'Jo', 'Szakadt'])
    .withMessage('Érvénytelen minőség')
];

const ruhaKiBeIdValidator = [
  param('ruhaKiBeId')
    .isInt()
    .withMessage('Érvénytelen tranzakció azonosító')
];

const dateRangeValidator = [
  query('from')
    .notEmpty()
    .withMessage('Kezdő dátum megadása kötelező')
    .isISO8601()
    .withMessage('Érvénytelen dátum formátum'),
  query('to')
    .notEmpty()
    .withMessage('Záró dátum megadása kötelező')
    .isISO8601()
    .withMessage('Érvénytelen dátum formátum')
];

module.exports = {
  createKiadásValidator,
  visszavetelValidator,
  ruhaKiBeIdValidator,
  dateRangeValidator
};

