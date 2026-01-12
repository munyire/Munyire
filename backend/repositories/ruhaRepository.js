const { models } = require("../db");
const { Op, Sequelize } = require("sequelize");

async function findAll() {
  return models.Ruha.findAll();
}

async function findById(id) {
  return models.Ruha.findByPk(id);
}

async function findByCikkszam(cikkszam) {
  return models.Ruha.findOne({ where: { Cikkszam: cikkszam } });
}

async function findByCikkszamPrefix(prefix) {
  return models.Ruha.findAll({
    where: {
      Cikkszam: {
        [Op.like]: `${prefix}-%`
      }
    },
    order: [['Cikkszam', 'DESC']],
    limit: 1
  });
}

async function findByAttributes(attributes) {
  const { Fajta, Szin, Meret, Minoseg } = attributes;
  return models.Ruha.findOne({
    where: {
      Fajta,
      Szin,
      Meret,
      Minoseg: Minoseg || "Új" // Ensure we match against default if null passed
    }
  });
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

async function getDistinctValues(field) {
  const result = await models.Ruha.findAll({
    attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(field)), field]],
    order: [[field, "ASC"]],
    raw: true,
  });
  return result.map((item) => item[field]).filter((val) => val);
}

module.exports = { findAll, findById, findByCikkszam, findByCikkszamPrefix, findByAttributes, search, create, update, remove, getDistinctValues };
