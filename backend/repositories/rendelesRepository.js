const { models } = require("../db");
const { Op } = require("sequelize");

async function findAll() {
  return models.Rendeles.findAll({ include: [models.Ruha] });
}

async function findById(id) {
  return models.Rendeles.findByPk(id, { include: [models.Ruha] });
}

async function create(data) {
  return models.Rendeles.create(data);
}

async function update(id, data) {
  const record = await models.Rendeles.findByPk(id);
  if (!record) return null;
  await record.update(data);
  return record;
}

async function remove(id) {
  return models.Rendeles.destroy({ where: { RendelesID: id } });
}

async function findPending() {
  return models.Rendeles.findAll({
    where: { Statusz: "Leadva" },
    include: [models.Ruha],
  });
}

async function findByStatus(statusz) {
  return models.Rendeles.findAll({
    where: { Statusz: statusz },
    include: [models.Ruha],
  });
}

async function findByRuha(ruhaId) {
  return models.Rendeles.findAll({
    where: { RuhaID: ruhaId },
    include: [models.Ruha],
  });
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findPending,
  findByStatus,
  findByRuha,
};
