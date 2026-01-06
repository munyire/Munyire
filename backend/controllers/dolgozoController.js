const dolgozoService = require("../services/dolgozoService");

async function list(req, res, next) {
  try {
    const items = await dolgozoService.list();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const item = await dolgozoService.get(req.params.dolgozoId);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const created = await dolgozoService.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const updated = await dolgozoService.update(req.params.dolgozoId, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await dolgozoService.remove(req.params.dolgozoId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function listClothes(req, res, next) {
  try {
    const items = await dolgozoService.listClothes(req.params.dolgozoId);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function listActiveClothes(req, res, next) {
  try {
    const items = await dolgozoService.listActiveClothes(req.params.dolgozoId);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function listWithActiveItems(req, res, next) {
  try {
    const items = await dolgozoService.listWithActiveItems();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  listClothes,
  listActiveClothes,
  listWithActiveItems,
};
