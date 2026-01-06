const reportsService = require("../services/reportsService");

async function stock(req, res, next) {
  try {
    res.json(await reportsService.stockByItem());
  } catch (err) {
    next(err);
  }
}

async function issued(req, res, next) {
  try {
    const { from, to } = req.query;
    res.json(await reportsService.issuedInPeriod({ from, to }));
  } catch (err) {
    next(err);
  }
}

async function returns(req, res, next) {
  try {
    const { from, to } = req.query;
    res.json(await reportsService.returnsInPeriod({ from, to }));
  } catch (err) {
    next(err);
  }
}

async function issuedCounts(req, res, next) {
  try {
    res.json(await reportsService.issuedCountsByItem());
  } catch (err) {
    next(err);
  }
}

module.exports = { stock, issued, returns, issuedCounts };
