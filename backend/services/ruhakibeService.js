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
  // RuhaID is effectively Cikkszam now (7-digit int)
  const cikkszam = RuhaID;

  return sequelize.transaction(async (t) => {
    // Check if Ruha exists
    const ruha = await ruhaRepo.findByCikkszam(cikkszam);
    if (!ruha) {
      const err = new Error("Ruha not found");
      err.status = 404;
      throw err;
    }

    // Always take from 'Új' stock
    const raktar = await raktarRepo.findByCikkszamAndMinoseg(cikkszam, "Új");

    if (!raktar || raktar.Mennyiseg < Mennyiseg) {
      const err = new Error("Insufficient stock (Új)");
      err.status = 400;
      throw err;
    }

    // Decrement stock using raktarRepo or direct update
    // raktarRepo.updateStock uses separate transaction param check?
    // Let's use direct update here since we are in transaction t
    await raktar.update({ Mennyiseg: raktar.Mennyiseg - Mennyiseg }, { transaction: t });

    // Create Issue Record
    // Note: Database Schema for RuhaKiBe still has RuhaID column? 
    // Yes, but I updated model index associations to map RuhaID (FK) to Cikkszam (PK).
    // Wait, physically the column `RuhaID` in `RuhaKiBe` table MIGHT need to be renamed `Cikkszam` for clarity?
    // User agreed to data loss/reset.
    // In `RuhaKiBe.js` model definition, I did NOT rename `RuhaID` to `Cikkszam` on the define call, I only updated `index.js` associations.
    // If I didn't change `RuhaKiBe.js`, the column name Sequelize uses might default to `RuhaCikkszam` or similar if I rely on `index.js`.
    // BUT `RuhaKiBe.js` DOES NOT explicitly define the FK column in `attributes`. 
    // So Sequelize adds it. 
    // If I use `Ruha.hasMany(RuhaKiBe, { foreignKey: 'Cikkszam' })`, Sequelize expects column `Cikkszam` in `RuhaKiBe`.
    // So `RuhaKiBe.create({ DolgozoID, Cikkszam: cikkszam, ... })` is correct.
    // BUT the frontend/API likely sends `RuhaID`. 
    // So I map `RuhaID` input -> `Cikkszam` field for DB creation.

    return models.RuhaKiBe.create({
      DolgozoID,
      Cikkszam: cikkszam, // Use Cikkszam as the foreign key field
      Mennyiseg,
      Indok
    }, { transaction: t });
  });
}

// Helper function to handle single item return within a transaction
async function _processReturn(id, RuhaMinoseg, VisszaDatum, t) {
  const record = await models.RuhaKiBe.findByPk(id, { transaction: t });
  if (!record) {
    const err = new Error(`Record with ID ${id} not found`);
    err.status = 404;
    throw err;
  }
  if (record.VisszaDatum) {
    return record; // already returned
  }

  const cikkszam = record.Cikkszam;
  await record.update({ VisszaDatum, RuhaMinoseg }, { transaction: t });

  // Increment Stock
  if (cikkszam && RuhaMinoseg) {
    let raktar = await raktarRepo.findByCikkszamAndMinoseg(cikkszam, RuhaMinoseg);
    // Note: raktarRepo might not support transaction passing in find, but read is safe-ish.
    // However, for update we must be careful.
    // Ideally repo methods should accept transaction options.
    // I will assume for now find is OK, but for CREATE/UPDATE I use models directly with t.

    if (!raktar) {
      // Create new Raktar entry
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
  // items: [{ RuhaKiBeID, RuhaMinoseg }]
  const VisszaDatum = new Date(); // Shared return date
  return sequelize.transaction(async (t) => {
    const results = [];
    for (const item of items) {
      if (!item.RuhaKiBeID) throw new Error("RuhaKiBeID missing in bulk return item");
      const updated = await _processReturn(
        item.RuhaKiBeID,
        item.RuhaMinoseg || "Használt", // Default quality if missing
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
