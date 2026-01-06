const { body } = require("express-validator");

const issueValidator = [
  body("DolgozoID").isInt({ min: 1 }),
  body("RuhaID").isInt({ min: 1 }),
  body("Mennyiseg").optional().isInt({ min: 1 }),
  body("Indok").optional().isString(),
];

const returnValidator = [
  body("RuhaMinoseg").optional().isString(),
  body("VisszaDatum").optional().isISO8601(),
];

module.exports = { issueValidator, returnValidator };
