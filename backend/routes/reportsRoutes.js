const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { monthlyReportValidator } = require('../validators/rendelesValidators');
const validationHandler = require('../middlewares/validationHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRoleMiddleware');

// GET /api/reports/inventory (Manager, Admin)
router.get('/inventory',
  authMiddleware,
  requireRole('Manager'),
  reportsController.getInventory.bind(reportsController)
);

// GET /api/reports/employee-summary (Manager, Admin)
router.get('/employee-summary',
  authMiddleware,
  requireRole('Manager'),
  reportsController.getEmployeeSummary.bind(reportsController)
);

// GET /api/reports/monthly (Manager, Admin)
router.get('/monthly',
  authMiddleware,
  requireRole('Manager'),
  monthlyReportValidator,
  validationHandler,
  reportsController.getMonthly.bind(reportsController)
);

// GET /api/reports/quality-summary (Admin)
router.get('/quality-summary',
  authMiddleware,
  requireRole('Admin'),
  reportsController.getQualitySummary.bind(reportsController)
);

module.exports = router;

