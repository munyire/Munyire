const ruhakibeService = require("../services/ruhakibeService");

async function list(req, res, next) {
  try {
    res.json(await ruhakibeService.list());
  } catch (err) {
    next(err);
  }
}

async function listMine(req, res, next) {
  try {
    res.json(await ruhakibeService.listMine(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function listActive(req, res, next) {
  try {
    res.json(await ruhakibeService.listActive());
  } catch (err) {
    next(err);
  }
}

async function listReturned(req, res, next) {
  try {
    res.json(await ruhakibeService.listReturned());
  } catch (err) {
    next(err);
  }
}

async function listByDate(req, res, next) {
  try {
    const { from, to } = req.query;
    res.json(await ruhakibeService.listByDate(from, to));
  } catch (err) {
    next(err);
  }
}

async function stats(req, res, next) {
  try {
    res.json(await ruhakibeService.getStats());
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const item = await ruhakibeService.get(req.params.ruhaKiBeId);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const created = await ruhakibeService.issue(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const updated = await ruhakibeService.markReturn(req.params.ruhaKiBeId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function returnItem(req, res, next) {
  try {
    const { RuhaKiBeID, RuhaMinoseg } = req.body;
    if (!RuhaKiBeID) {
      return res.status(400).json({ error: "RuhaKiBeID is required for return action" });
    }
    const updated = await ruhakibeService.markReturn(RuhaKiBeID, { RuhaMinoseg });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function returnMultipleItems(req, res, next) {
  try {
    const { items } = req.body; // Expects { items: [{ RuhaKiBeID, RuhaMinoseg }, ...] }
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "items array is required" });
    }
    const results = await ruhakibeService.markReturnMultiple(items);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await ruhakibeService.remove(req.params.ruhaKiBeId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  listMine,
  listActive,
  listReturned,
  listByDate,
  stats,
  get,
  create,
  update,
  returnItem,
  returnMultipleItems,
  remove,
};
