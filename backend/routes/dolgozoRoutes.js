const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRoleMiddleware");
const { ROLES } = require("../utils/roles");
const validationHandler = require("../middlewares/validationHandler");
const { createDolgozo, updateDolgozo } = require("../validators/dolgozoValidators");
const controller = require("../controllers/dolgozoController");

router.use(auth);

router.get("/", requireRole(ROLES.Manager), controller.list);
router.get("/:id", requireRole(ROLES.Manager), controller.get);
router.post("/", requireRole(ROLES.Admin), createDolgozo, validationHandler, controller.create);
router.put("/:id", requireRole(ROLES.Admin), updateDolgozo, validationHandler, controller.update);
router.delete("/:id", requireRole(ROLES.Admin), controller.remove);

module.exports = router;
