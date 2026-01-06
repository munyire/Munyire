const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRoleMiddleware");
const { ROLES } = require("../utils/roles");
const controller = require("../controllers/dashboardController");

router.use(auth);

router.get("/stats", requireRole(ROLES.Manager), controller.stats);
router.get("/low-stock", requireRole(ROLES.Manager), controller.lowStock);
router.get("/recent-activity", requireRole(ROLES.Manager), controller.recentActivity);

module.exports = router;
