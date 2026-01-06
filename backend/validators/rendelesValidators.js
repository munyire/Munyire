const { body } = require("express-validator");

const createRendeles = [
  body("RuhaID").isInt({ min: 1 }),
  body("Mennyiseg").isInt({ min: 1 }),
  body("Statusz").optional().isIn(["Leadva", "Teljesítve", "Lemondva"]),
  body("RDatum").optional().isISO8601(),
];

const updateRendeles = createRendeles.map((rule) => rule.optional());

module.exports = { createRendeles, updateRendeles };
