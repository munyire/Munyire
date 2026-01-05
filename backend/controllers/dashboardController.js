const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getStats(req, res, next) {
    try {
      const stats = await dashboardService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getLowStock(req, res, next) {
    try {
      const threshold = parseInt(req.query.threshold) || 10;
      const ruhak = await dashboardService.getLowStock(threshold);
      res.json(ruhak);
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const activity = await dashboardService.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();

