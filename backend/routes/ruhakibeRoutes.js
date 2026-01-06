const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRoleMiddleware");
const { ROLES } = require("../utils/roles");
const validationHandler = require("../middlewares/validationHandler");
const { issueValidator, returnValidator } = require("../validators/ruhakibeValidators");
const controller = require("../controllers/ruhakibeController");

router.use(auth);

router.get("/", requireRole(ROLES.Manager), controller.list);
router.post("/issue", requireRole(ROLES.Manager), issueValidator, validationHandler, controller.issue);
router.post("/:id/return", requireRole(ROLES.Manager), returnValidator, validationHandler, controller.markReturn);

module.exports = router;
