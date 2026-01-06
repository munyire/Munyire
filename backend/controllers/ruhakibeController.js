const ruhakibeService = require("../services/ruhakibeService");

async function list(req, res, next) {
  try {
    res.json(await ruhakibeService.list());
  } catch (err) {
    next(err);
  }
}

async function issue(req, res, next) {
  try {
    const created = await ruhakibeService.issue(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function markReturn(req, res, next) {
  try {
    const updated = await ruhakibeService.markReturn(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, issue, markReturn };
