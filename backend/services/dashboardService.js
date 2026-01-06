const dashboardRepo = require("../repositories/dashboardRepository");

async function getSummary() {
  const [counts, recent, orders] = await Promise.all([
    dashboardRepo.getCounts(),
    dashboardRepo.recentIssued(),
    dashboardRepo.pendingOrders(),
  ]);
  return { counts, recent, orders };
}

module.exports = { getSummary };
