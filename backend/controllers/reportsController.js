const reportsService = require("../services/reportsService");

async function inventory(req, res, next) {
  try {
    res.json(await reportsService.inventory());
  } catch (err) {
    next(err);
  }
}

async function employeeSummary(req, res, next) {
  try {
    res.json(await reportsService.employeeSummary());
  } catch (err) {
    next(err);
  }
}

async function monthly(req, res, next) {
  try {
    const { year, month } = req.query;
    res.json(await reportsService.monthly(Number(year), Number(month)));
  } catch (err) {
    next(err);
  }
}

async function qualitySummary(req, res, next) {
  try {
    res.json(await reportsService.qualitySummary());
  } catch (err) {
    next(err);
  }
}

module.exports = { inventory, employeeSummary, monthly, qualitySummary };
