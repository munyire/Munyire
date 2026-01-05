const dashboardRepository = require('../repositories/dashboardRepository');

class DashboardService {
  async getStats() {
    return await dashboardRepository.getStats();
  }

  async getLowStock(threshold = 10) {
    return await dashboardRepository.getLowStock(threshold);
  }

  async getRecentActivity(limit = 10) {
    return await dashboardRepository.getRecentActivity(limit);
  }
}

module.exports = new DashboardService();

