const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRoleMiddleware");
const { ROLES } = require("../utils/roles");
const controller = require("../controllers/reportsController");

router.use(auth);

router.get("/inventory", requireRole(ROLES.Manager), controller.inventory);
router.get("/employee-summary", requireRole(ROLES.Manager), controller.employeeSummary);
router.get("/monthly", requireRole(ROLES.Manager), controller.monthly);
router.get("/quality-summary", requireRole(ROLES.Admin), controller.qualitySummary);

// Pénzügyi riportok (V2)
router.get("/expenses/monthly", requireRole(ROLES.Manager), controller.monthlyExpenses);
router.get("/expenses/yearly", requireRole(ROLES.Manager), controller.yearlyExpenses);
router.get("/expenses/half-year", requireRole(ROLES.Manager), controller.halfYearExpenses);
router.get("/inventory-value", requireRole(ROLES.Manager), controller.inventoryValue);

module.exports = router;
