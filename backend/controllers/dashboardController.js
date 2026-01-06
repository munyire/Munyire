const dashboardService = require("../services/dashboardService");

async function summary(req, res, next) {
  try {
    const data = await dashboardService.getSummary();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { summary };
