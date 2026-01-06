const { models } = require("../db");

async function findAll() {
  return models.Ruha.findAll();
}

async function findById(id) {
  return models.Ruha.findByPk(id);
}

async function create(data) {
  return models.Ruha.create(data);
}

async function update(id, data) {
  const record = await findById(id);
  if (!record) return null;
  await record.update(data);
  return record;
}

async function remove(id) {
  return models.Ruha.destroy({ where: { RuhaID: id } });
}

module.exports = { findAll, findById, create, update, remove };
