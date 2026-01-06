const { body } = require("express-validator");

const baseFields = [
  body("DNev").isString().notEmpty(),
  body("Email").isEmail(),
  body("Telefonszam").optional().isString(),
  body("Nem").optional().isString(),
  body("Munkakor").optional().isString(),
  body("Szerepkor").isString().notEmpty(),
  body("FelhasznaloNev").isString().notEmpty(),
];

const createDolgozo = [...baseFields, body("password").isString().isLength({ min: 4 })];

const updateDolgozo = [
  ...baseFields.map((rule) => rule.optional()),
  body("password").optional().isString().isLength({ min: 4 }),
];

module.exports = { createDolgozo, updateDolgozo };
