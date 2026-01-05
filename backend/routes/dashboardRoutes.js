const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRoleMiddleware');

// GET /api/dashboard/stats (Manager, Admin)
router.get('/stats',
  authMiddleware,
  requireRole('Manager'),
  dashboardController.getStats.bind(dashboardController)
);

// GET /api/dashboard/low-stock (Manager, Admin)
router.get('/low-stock',
  authMiddleware,
  requireRole('Manager'),
  dashboardController.getLowStock.bind(dashboardController)
);

// GET /api/dashboard/recent-activity (Manager, Admin)
router.get('/recent-activity',
  authMiddleware,
  requireRole('Manager'),
  dashboardController.getRecentActivity.bind(dashboardController)
);

module.exports = router;

