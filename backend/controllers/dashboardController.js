const dashboardService = require("../services/dashboardService");

async function stats(req, res, next) {
  try {
    const data = await dashboardService.getStats();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function lowStock(req, res, next) {
  try {
    const data = await dashboardService.getLowStock();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function recentActivity(req, res, next) {
  try {
    const data = await dashboardService.getRecentActivity();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { stats, lowStock, recentActivity };
