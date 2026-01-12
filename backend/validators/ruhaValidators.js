const { body } = require("express-validator");

const createRuha = [
  body("Cikkszam").optional().isInt(), // Auto-generated or manual override
  body("Fajta").isString().notEmpty(),
  body("Szin").isString().notEmpty(),
  body("Meret").isString().notEmpty(),
  body("Mennyiseg").optional().isInt({ min: 0 }), // Optional initial stock
  body("Minoseg").optional().isString(), // Optional initial quality (Default 'Új')
];

const updateRuha = createRuha.map((rule) => rule.optional());

module.exports = { createRuha, updateRuha };
