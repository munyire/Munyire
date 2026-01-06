const { models } = require("../db");
const { Op } = require("sequelize");

async function findAll() {
  return models.Ruha.findAll();
}

async function findById(id) {
  return models.Ruha.findByPk(id);
}

async function findByCikkszam(cikkszam) {
  return models.Ruha.findOne({ where: { Cikkszam: cikkszam } });
}

async function search(q) {
  if (!q) return findAll();
  const like = `%${q}%`;
  return models.Ruha.findAll({
    where: {
      [Op.or]: [
        { Cikkszam: { [Op.like]: like } },
        { Fajta: { [Op.like]: like } },
        { Szin: { [Op.like]: like } },
        { Meret: { [Op.like]: like } },
      ],
    },
  });
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

module.exports = { findAll, findById, findByCikkszam, search, create, update, remove };
