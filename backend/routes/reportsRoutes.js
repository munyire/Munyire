const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRoleMiddleware");
const { ROLES } = require("../utils/roles");
const controller = require("../controllers/reportsController");

router.use(auth);
router.get("/stock", requireRole(ROLES.Manager), controller.stock);
router.get("/issued", requireRole(ROLES.Manager), controller.issued);
router.get("/returns", requireRole(ROLES.Manager), controller.returns);
router.get("/issued-counts", requireRole(ROLES.Manager), controller.issuedCounts);

module.exports = router;
