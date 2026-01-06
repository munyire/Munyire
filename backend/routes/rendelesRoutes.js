const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRoleMiddleware");
const { ROLES } = require("../utils/roles");
const validationHandler = require("../middlewares/validationHandler");
const { createRendeles, updateRendeles } = require("../validators/rendelesValidators");
const controller = require("../controllers/rendelesController");

router.use(auth);

router.get("/", requireRole(ROLES.Manager), controller.list);
router.get("/:id", requireRole(ROLES.Manager), controller.get);
router.post("/", requireRole(ROLES.Manager), createRendeles, validationHandler, controller.create);
router.put("/:id", requireRole(ROLES.Manager), updateRendeles, validationHandler, controller.update);
router.delete("/:id", requireRole(ROLES.Admin), controller.remove);

module.exports = router;
