const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const validationHandler = require("../middlewares/validationHandler");
const { loginValidator, registerValidator } = require("../validators/authValidators");

router.post("/register", registerValidator, validationHandler, authController.register);
router.post("/login", loginValidator, validationHandler, authController.login);

module.exports = router;
