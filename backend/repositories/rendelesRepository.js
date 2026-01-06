const { models } = require("../db");

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

module.exports = { findAll, findById, create, update, remove };
