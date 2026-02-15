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

// Havi kiadások
async function monthlyExpenses(req, res, next) {
  try {
    const { year, month } = req.query;
    res.json(await reportsService.monthlyExpenses(Number(year), Number(month)));
  } catch (err) {
    next(err);
  }
}

// Éves kiadások
async function yearlyExpenses(req, res, next) {
  try {
    const { year } = req.query;
    res.json(await reportsService.yearlyExpenses(Number(year)));
  } catch (err) {
    next(err);
  }
}

// Féléves kiadások
async function halfYearExpenses(req, res, next) {
  try {
    const { year, half } = req.query;
    res.json(await reportsService.halfYearExpenses(Number(year), Number(half)));
  } catch (err) {
    next(err);
  }
}

// Készlet érték
async function inventoryValue(req, res, next) {
  try {
    res.json(await reportsService.inventoryValue());
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  inventory, 
  employeeSummary, 
  monthly, 
  qualitySummary,
  monthlyExpenses,
  yearlyExpenses,
  halfYearExpenses,
  inventoryValue
};
