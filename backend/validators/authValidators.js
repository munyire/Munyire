const { body } = require("express-validator");

const loginValidator = [
  body("username").isString().notEmpty(),
  body("password").isString().isLength({ min: 4 }),
];

const registerValidator = [
  body("name").isString().notEmpty(),
  body("email").isEmail(),
  body("username").isString().notEmpty(),
  body("password").isString().isLength({ min: 4 }),
  body("role").optional().isString(),
];

module.exports = { loginValidator, registerValidator };
