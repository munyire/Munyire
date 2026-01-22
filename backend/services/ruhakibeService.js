const { sequelize, models } = require("../db");
const ruhakibeRepo = require("../repositories/ruhakibeRepository");
const ruhaRepo = require("../repositories/ruhaRepository");
const raktarRepo = require("../repositories/raktarRepository");

async function list() {
  return ruhakibeRepo.findAll();
}

async function listMine(dolgozoId) {
  return ruhakibeRepo.findMine(dolgozoId);
}

async function listActive() {
  return ruhakibeRepo.findActive();
}

async function listReturned() {
  return ruhakibeRepo.findReturned();
}

async function listByDate(from, to) {
  return ruhakibeRepo.findByDateRange(from, to);
}

async function getStats() {
  return ruhakibeRepo.stats();
}

async function get(id) {
  return ruhakibeRepo.findById(id);
}

async function issue({ DolgozoID, RuhaID, Mennyiseg = 1, Indok }) {
  const cikkszam = RuhaID;

  return sequelize.transaction(async (t) => {
    const ruha = await ruhaRepo.findByCikkszam(cikkszam);
    if (!ruha) {
      const err = new Error("Ruha not found");
      err.status = 404;
      throw err;
    }

    const raktar = await raktarRepo.findByCikkszamAndMinoseg(cikkszam, "Új", { transaction: t });

    if (!raktar || raktar.Mennyiseg < Mennyiseg) {
      const err = new Error("Insufficient stock (Új)");
      err.status = 400;
      throw err;
    }

    await raktar.update({ Mennyiseg: raktar.Mennyiseg - Mennyiseg }, { transaction: t });

    return models.RuhaKiBe.create({
      DolgozoID,
      Cikkszam: cikkszam,
      Mennyiseg,
      Indok
    }, { transaction: t });
  });
}

async function _processReturn(id, RuhaMinoseg, VisszaDatum, t) {
  const record = await models.RuhaKiBe.findByPk(id, { transaction: t });
  if (!record) {
    const err = new Error(`Record with ID ${id} not found`);
    err.status = 404;
    throw err;
  }
  if (record.VisszaDatum) {
    return record;
  }

  const cikkszam = record.Cikkszam;
  await record.update({ VisszaDatum, RuhaMinoseg }, { transaction: t });

  if (cikkszam && RuhaMinoseg) {
    let raktar = await raktarRepo.findByCikkszamAndMinoseg(cikkszam, RuhaMinoseg, { transaction: t });

    if (!raktar) {
      raktar = await models.Raktar.create({
        Cikkszam: cikkszam,
        Minoseg: RuhaMinoseg,
        Mennyiseg: 0
      }, { transaction: t });
    }

    await raktar.update({ Mennyiseg: raktar.Mennyiseg + record.Mennyiseg }, { transaction: t });
  }
  return record;
}

async function markReturn(id, { RuhaMinoseg, VisszaDatum = new Date() }) {
  return sequelize.transaction(async (t) => {
    return _processReturn(id, RuhaMinoseg, VisszaDatum, t);
  });
}

async function markReturnMultiple(items) {
  const VisszaDatum = new Date();
  return sequelize.transaction(async (t) => {
    const results = [];
    for (const item of items) {
      if (!item.RuhaKiBeID) throw new Error("RuhaKiBeID missing in bulk return item");
      const updated = await _processReturn(
        item.RuhaKiBeID,
        item.RuhaMinoseg || "Használt",
        VisszaDatum,
        t
      );
      results.push(updated);
    }
    return results;
  });
}

async function remove(id) {
  return ruhakibeRepo.remove(id);
}

module.exports = {
  list,
  listMine,
  listActive,
  listReturned,
  listByDate,
  getStats,
  get,
  issue,
  markReturn,
  markReturnMultiple,
  remove,
};
