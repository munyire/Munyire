const { sequelize, models } = require("../db");
const ruhakibeRepo = require("../repositories/ruhakibeRepository");
const ruhaRepo = require("../repositories/ruhaRepository");

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
  return sequelize.transaction(async (t) => {
    const ruha = await ruhaRepo.findById(RuhaID);
    if (!ruha) {
      const err = new Error("Ruha not found");
      err.status = 404;
      throw err;
    }
    if (ruha.Mennyiseg < Mennyiseg) {
      const err = new Error("Insufficient stock");
      err.status = 400;
      throw err;
    }
    await ruha.update({ Mennyiseg: ruha.Mennyiseg - Mennyiseg }, { transaction: t });
    return models.RuhaKiBe.create({ DolgozoID, RuhaID, Mennyiseg, Indok }, { transaction: t });
  });
}

async function markReturn(id, { RuhaMinoseg, VisszaDatum = new Date() }) {
  return sequelize.transaction(async (t) => {
    const record = await models.RuhaKiBe.findByPk(id, { transaction: t });
    if (!record) {
      const err = new Error("Record not found");
      err.status = 404;
      throw err;
    }
    if (record.VisszaDatum) {
      return record; // already returned
    }
    const ruha = await ruhaRepo.findById(record.RuhaID);
    await record.update({ VisszaDatum, RuhaMinoseg }, { transaction: t });
    if (ruha) {
      await ruha.update({ Mennyiseg: ruha.Mennyiseg + record.Mennyiseg }, { transaction: t });
    }
    return record;
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
  remove,
};
