const ruhaService = require("../services/ruhaService");

async function list(req, res, next) {
  try {
    res.json(await ruhaService.list());
  } catch (err) {
    next(err);
  }
}

async function search(req, res, next) {
  try {
    const { q } = req.query;
    res.json(await ruhaService.search(q));
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const item = await ruhaService.get(req.params.ruhaId);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function getByCikkszam(req, res, next) {
  try {
    const item = await ruhaService.getByCikkszam(req.params.cikkszam);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function history(req, res, next) {
  try {
    const items = await ruhaService.history(req.params.ruhaId);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function active(req, res, next) {
  try {
    const items = await ruhaService.active(req.params.ruhaId);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const created = await ruhaService.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const updated = await ruhaService.update(req.params.ruhaId, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await ruhaService.remove(req.params.ruhaId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  search,
  get,
  getByCikkszam,
  history,
  active,
  create,
  update,
  remove,
};
