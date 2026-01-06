const { models } = require("../db");

async function findById(id) {
  return models.Dolgozo.findByPk(id);
}

async function findByUsername(username) {
  return models.Dolgozo.findOne({ where: { FelhasznaloNev: username } });
}

async function findAll() {
  return models.Dolgozo.findAll();
}

async function create(data) {
  return models.Dolgozo.create(data);
}

async function update(id, data) {
  const record = await findById(id);
  if (!record) return null;
  await record.update(data);
  return record;
}

async function remove(id) {
  return models.Dolgozo.destroy({ where: { DolgozoID: id } });
}

module.exports = { findById, findByUsername, findAll, create, update, remove };
