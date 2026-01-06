const { models } = require("../db");
const { Op } = require("sequelize");

async function getStats() {
  const [dolgozoCount, ruhaCount, activeKibe, pendingOrders] = await Promise.all([
    models.Dolgozo.count(),
    models.Ruha.count(),
    models.RuhaKiBe.count({ where: { VisszaDatum: null } }),
    models.Rendeles.count({ where: { Statusz: { [Op.ne]: "Teljesítve" } } }),
  ]);
  return { dolgozoCount, ruhaCount, activeKibe, pendingOrders };
}

async function getLowStock(threshold) {
  return models.Ruha.findAll({
    where: {
      Mennyiseg: { [Op.lte]: threshold },
    },
  });
}

async function getRecentActivity(limit = 10) {
  const recentKibe = await models.RuhaKiBe.findAll({
    order: [["createdAt", "DESC"]],
    limit,
    include: [models.Dolgozo, models.Ruha],
  });
  const recentOrders = await models.Rendeles.findAll({
    order: [["createdAt", "DESC"]],
    limit,
    include: [models.Ruha],
  });
  return { recentKibe, recentOrders };
}

module.exports = { getStats, getLowStock, getRecentActivity };
