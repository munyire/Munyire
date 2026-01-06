const dashboardRepo = require("../repositories/dashboardRepository");

async function getStats() {
  return dashboardRepo.getStats();
}

async function getLowStock() {
  const threshold = Number(process.env.LOW_STOCK_THRESHOLD) || 5;
  return dashboardRepo.getLowStock(threshold);
}

async function getRecentActivity() {
  return dashboardRepo.getRecentActivity(10);
}

module.exports = { getStats, getLowStock, getRecentActivity };
