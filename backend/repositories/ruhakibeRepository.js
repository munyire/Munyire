const { models } = require("../db");

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

module.exports = { findAll, findById, create, update };
