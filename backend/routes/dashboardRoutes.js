const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRoleMiddleware");
const { ROLES } = require("../utils/roles");
const controller = require("../controllers/dashboardController");

router.use(auth);
router.get("/", requireRole(ROLES.Manager), controller.summary);

module.exports = router;
