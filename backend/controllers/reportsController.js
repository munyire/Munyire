const reportsService = require('../services/reportsService');

class ReportsController {
  async getInventory(req, res, next) {
    try {
      const report = await reportsService.getInventoryReport();
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeSummary(req, res, next) {
    try {
      const summary = await reportsService.getEmployeeSummary();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  async getMonthly(req, res, next) {
    try {
      const year = parseInt(req.query.year);
      const month = parseInt(req.query.month);
      const report = await reportsService.getMonthlyReport(year, month);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async getQualitySummary(req, res, next) {
    try {
      const summary = await reportsService.getQualitySummary();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportsController();

