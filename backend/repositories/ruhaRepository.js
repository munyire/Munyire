const { models } = require("../db");
const { Op, Sequelize } = require("sequelize");

async function findAll() {
  return models.Ruha.findAll({
    include: [{ model: models.Raktar }]
  });
}

async function findById(cikkszam) {
  return models.Ruha.findByPk(cikkszam, {
    include: [{ model: models.Raktar }]
  });
}

// ensure we find by Cikkszam (PK)
async function findByCikkszam(cikkszam) {
  return findById(cikkszam);
}

async function findByCikkszamPrefix(prefix) {
  // prefix format: TYPE-COLOR-SIZE
  return models.Ruha.findAll({
    where: {
      Cikkszam: {
        [Op.like]: `${prefix}%` // Changed from prefix-% to prefix% because Cikkszam is int, but here we query it as string-like?
        // Wait, Cikkszam is INTEGER now. LIKE operator on Integer in SQLite works but implicitly converts.
        // The SKU generation logic in service plans to make Cikkszam = 7 digit int.
        // So finding by prefix means finding range? Or convert to string?
        // User said: "Cikkszam will be the Primary Key (7-digit Integer)." and "SKU format: TYPE-COLOR-SIZE-SEQ" was OLD plan?
        // NO. User comment: "No the cikszám should be a 7 digit int code like an id"
        // So prefix logic based on Type-Color-Size-Seq string is OBSOLETE.
        // I need to search for MAX Cikkszam to generate next one? Or just auto-increment logic or random?
        // Plan said: "Generate Cikkszam: Start at 1000000 or find max + 1."
        // So I need findMaxCikkszam?
      }
    },
    order: [['Cikkszam', 'DESC']],
    limit: 1
  });
}

// Correction: I need a method to find Max Cikkszam.
async function findMaxCikkszam() {
  return models.Ruha.max('Cikkszam');
}

async function findByAttributes(attributes) {
  const { Fajta, Szin, Meret } = attributes;
  return models.Ruha.findOne({
    where: {
      Fajta,
      Szin,
      Meret
    },
    include: [{ model: models.Raktar }]
  });
}

async function search(q) {
  if (!q) return findAll();
  const like = `%${q}%`;
  return models.Ruha.findAll({
    where: {
      [Op.or]: [
        Sequelize.where(Sequelize.cast(Sequelize.col('Ruha.Cikkszam'), 'char'), { [Op.like]: like }), // Explicit table name
        { Fajta: { [Op.like]: like } },
        { Szin: { [Op.like]: like } },
        { Meret: { [Op.like]: like } },
      ],
    },
    include: [{ model: models.Raktar }]
  });
}

async function create(data) {
  // data should contain Cikkszam
  return models.Ruha.create(data);
}

async function update(cikkszam, data) {
  const record = await findById(cikkszam);
  if (!record) return null;
  await record.update(data);
  return record;
}

async function remove(cikkszam) {
  return models.Ruha.destroy({ where: { Cikkszam: cikkszam } });
}

async function getDistinctValues(field) {
  const result = await models.Ruha.findAll({
    attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(field)), field]],
    order: [[field, "ASC"]],
    raw: true,
  });
  return result.map((item) => item[field]).filter((val) => val);
}

module.exports = { findAll, findById, findByCikkszam, findMaxCikkszam, findByAttributes, search, create, update, remove, getDistinctValues };
