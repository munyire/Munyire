const { models } = require("../db");
const { Op, fn, col } = require("sequelize");

async function findAll() {
  return models.RuhaKiBe.findAll({ include: [models.Dolgozo, models.Ruha] });
}

async function findById(id) {
  return models.RuhaKiBe.findByPk(id, { include: [models.Dolgozo, models.Ruha] });
}

async function create(data) {
  return models.RuhaKiBe.create(data);
}

async function update(id, data) {
  const record = await models.RuhaKiBe.findByPk(id);
  if (!record) return null;
  await record.update(data);
  return record;
}

async function remove(id) {
  return models.RuhaKiBe.destroy({ where: { RuhaKiBeID: id } });
}

async function findByDolgozo(dolgozoId) {
  return models.RuhaKiBe.findAll({
    where: { DolgozoID: dolgozoId },
    include: [models.Ruha],
  });
}

async function findActiveByDolgozo(dolgozoId) {
  return models.RuhaKiBe.findAll({
    where: { DolgozoID: dolgozoId, VisszaDatum: null },
    include: [models.Ruha],
  });
}

async function findDolgozokWithActive() {
  return models.RuhaKiBe.findAll({
    where: { VisszaDatum: null },
    attributes: ["DolgozoID", [fn("COUNT", col("RuhaKiBeID")), "activeCount"]],
    include: [models.Dolgozo],
    group: ["DolgozoID"],
  });
}

async function findActive() {
  return models.RuhaKiBe.findAll({
    where: { VisszaDatum: null },
    include: [models.Dolgozo, models.Ruha],
  });
}

async function findReturned() {
  return models.RuhaKiBe.findAll({
    where: { VisszaDatum: { [Op.ne]: null } },
    include: [models.Dolgozo, models.Ruha],
  });
}

async function findByDateRange(from, to) {
  const where = {};
  if (from || to) {
    where.KiadasDatum = {};
    if (from) where.KiadasDatum[Op.gte] = from;
    if (to) where.KiadasDatum[Op.lte] = to;
  }
  return models.RuhaKiBe.findAll({ where, include: [models.Dolgozo, models.Ruha] });
}

async function stats() {
  const totalIssued = await models.RuhaKiBe.count();
  const active = await models.RuhaKiBe.count({ where: { VisszaDatum: null } });
  const returned = totalIssued - active;
  return { totalIssued, active, returned };
}

async function findMine(dolgozoId) {
  return models.RuhaKiBe.findAll({
    where: { DolgozoID: dolgozoId },
    include: [models.Ruha],
  });
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findByDolgozo,
  findActiveByDolgozo,
  findDolgozokWithActive,
  findActive,
  findReturned,
  findByDateRange,
  stats,
  findMine,
};
