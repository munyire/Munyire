const { models } = require("../db");
const { Op, fn, col } = require("sequelize");

// Teljes készletjelentés
async function inventory() {
  return models.Ruha.findAll();
}

// Dolgozónkénti összesítő
async function employeeSummary() {
  return models.RuhaKiBe.findAll({
    attributes: [
      "DolgozoID",
      [fn("COUNT", col("RuhaKiBeID")), "transactionCount"],
      [fn("SUM", col("Mennyiseg")), "totalQuantity"],
    ],
    include: [models.Dolgozo],
    group: ["DolgozoID"],
  });
}

// Havi riport
async function monthly(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const issued = await models.RuhaKiBe.findAll({
    where: {
      KiadasDatum: { [Op.between]: [start, end] },
    },
  });

  const returned = await models.RuhaKiBe.findAll({
    where: {
      VisszaDatum: { [Op.between]: [start, end] },
    },
  });

  return { issued, returned };
}

// Minőség szerinti összesítés
async function qualitySummary() {
  return models.RuhaKiBe.findAll({
    attributes: ["RuhaMinoseg", [fn("COUNT", col("RuhaKiBeID")), "count"]],
    group: ["RuhaMinoseg"],
  });
}

module.exports = { inventory, employeeSummary, monthly, qualitySummary };
