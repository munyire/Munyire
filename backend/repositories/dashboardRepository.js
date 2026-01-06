const { models } = require("../db");
const { Op } = require("sequelize");

async function getCounts() {
  const [dolgozoCount, ruhaCount, kibeCount, rendelesCount] = await Promise.all([
    models.Dolgozo.count(),
    models.Ruha.count(),
    models.RuhaKiBe.count(),
    models.Rendeles.count(),
  ]);
  return { dolgozoCount, ruhaCount, kibeCount, rendelesCount };
}

async function recentIssued(limit = 5) {
  return models.RuhaKiBe.findAll({
    order: [["createdAt", "DESC"]],
    limit,
    include: [models.Dolgozo, models.Ruha],
  });
}

async function pendingOrders(limit = 5) {
  return models.Rendeles.findAll({
    where: { Statusz: { [Op.ne]: "Teljesítve" } },
    order: [["createdAt", "DESC"]],
    limit,
    include: [models.Ruha],
  });
}

module.exports = { getCounts, recentIssued, pendingOrders };
