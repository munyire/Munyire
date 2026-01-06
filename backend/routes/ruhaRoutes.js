const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRoleMiddleware");
const { ROLES } = require("../utils/roles");
const validationHandler = require("../middlewares/validationHandler");
const { createRuha, updateRuha } = require("../validators/ruhaValidators");
const controller = require("../controllers/ruhaController");

router.use(auth);

router.get("/", requireRole(ROLES.Manager), controller.list);
router.get("/:id", requireRole(ROLES.Manager), controller.get);
router.post("/", requireRole(ROLES.Admin), createRuha, validationHandler, controller.create);
router.put("/:id", requireRole(ROLES.Admin), updateRuha, validationHandler, controller.update);
router.delete("/:id", requireRole(ROLES.Admin), controller.remove);

module.exports = router;
