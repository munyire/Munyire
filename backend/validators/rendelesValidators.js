const { body, param, query } = require('express-validator');

const createRendelesValidator = [
  body('RuhaID')
    .notEmpty()
    .withMessage('Ruhacikk azonosító megadása kötelező')
    .isInt()
    .withMessage('Érvénytelen ruhacikk azonosító'),
  body('RDatum')
    .optional()
    .isISO8601()
    .withMessage('Érvénytelen dátum formátum'),
  body('Mennyiseg')
    .notEmpty()
    .withMessage('Mennyiség megadása kötelező')
    .isInt({ min: 1 })
    .withMessage('A mennyiség pozitív egész szám kell legyen'),
  body('Statusz')
    .optional()
    .isIn(['Leadva', 'Teljesítve', 'Lemondva'])
    .withMessage('Érvénytelen státusz')
];

const updateRendelesValidator = [
  param('rendelesId')
    .isInt()
    .withMessage('Érvénytelen rendelés azonosító'),
  body('Statusz')
    .optional()
    .isIn(['Leadva', 'Teljesítve', 'Lemondva'])
    .withMessage('Érvénytelen státusz'),
  body('Mennyiseg')
    .optional()
    .isInt({ min: 1 })
    .withMessage('A mennyiség pozitív egész szám kell legyen')
];

const rendelesIdValidator = [
  param('rendelesId')
    .isInt()
    .withMessage('Érvénytelen rendelés azonosító')
];

const statuszValidator = [
  param('statusz')
    .isIn(['Leadva', 'Teljesítve', 'Lemondva'])
    .withMessage('Érvénytelen státusz')
];

const ruhaIdValidator = [
  param('ruhaId')
    .isInt()
    .withMessage('Érvénytelen ruhacikk azonosító')
];

const monthlyReportValidator = [
  query('year')
    .notEmpty()
    .withMessage('Év megadása kötelező')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Érvénytelen év'),
  query('month')
    .notEmpty()
    .withMessage('Hónap megadása kötelező')
    .isInt({ min: 1, max: 12 })
    .withMessage('Érvénytelen hónap (1-12)')
];

module.exports = {
  createRendelesValidator,
  updateRendelesValidator,
  rendelesIdValidator,
  statuszValidator,
  ruhaIdValidator,
  monthlyReportValidator
};

