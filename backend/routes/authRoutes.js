const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const validationHandler = require("../middlewares/validationHandler");
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRoleMiddleware");
const { ROLES } = require("../utils/roles");
const { loginValidator, registerValidator } = require("../validators/authValidators");

// Login remains public
router.post("/login", loginValidator, validationHandler, authController.login);

// Registration is restricted to Admin (provisioning employees only)
router.post(
  "/register",
  auth,
  requireRole(ROLES.Admin),
  registerValidator,
  validationHandler,
  authController.register
);

module.exports = router;
