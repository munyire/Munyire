const { body } = require("express-validator");

const createRuha = [
  body("Cikkszam").isString().notEmpty(),
  body("Fajta").isString().notEmpty(),
  body("Szin").isString().notEmpty(),
  body("Meret").isString().notEmpty(),
  body("Mennyiseg").isInt({ min: 0 }),
  body("Minoseg").optional().isString(),
];

const updateRuha = createRuha.map((rule) => rule.optional());

module.exports = { createRuha, updateRuha };
