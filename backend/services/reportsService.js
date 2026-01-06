const { models } = require("../db");
const { Op, fn, col } = require("sequelize");

async function stockByItem() {
  return models.Ruha.findAll({
    attributes: ["RuhaID", "Cikkszam", "Fajta", "Szin", "Meret", "Mennyiseg"],
  });
}

async function issuedInPeriod({ from, to }) {
  return models.RuhaKiBe.findAll({
    where: {
      KiadasDatum: {
        [Op.between]: [from, to],
      },
    },
    include: [models.Dolgozo, models.Ruha],
  });
}

async function returnsInPeriod({ from, to }) {
  return models.RuhaKiBe.findAll({
    where: {
      VisszaDatum: {
        [Op.between]: [from, to],
      },
    },
    include: [models.Dolgozo, models.Ruha],
  });
}

async function issuedCountsByItem() {
  return models.RuhaKiBe.findAll({
    attributes: ["RuhaID", [fn("COUNT", col("RuhaKiBeID")), "issueCount"]],
    group: ["RuhaID"],
  });
}

module.exports = { stockByItem, issuedInPeriod, returnsInPeriod, issuedCountsByItem };
