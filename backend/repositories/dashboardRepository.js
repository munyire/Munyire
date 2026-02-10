const { models, sequelize } = require("../db");
const { Op } = require("sequelize");

async function getStats() {
  const [dolgozoCount, ruhaCount, activeKibe, pendingOrders] = await Promise.all([
    models.Dolgozo.count(),
    models.Raktar.sum('Mennyiseg'),
    models.RuhaKiBe.count({ where: { VisszaDatum: null } }),
    models.Rendeles.count({ where: { Statusz: { [Op.ne]: "Teljesítve" } } }),
  ]);
  return {
    totalWorkers: dolgozoCount,
    totalClothes: ruhaCount || 0,
    activeIssues: activeKibe,
    totalOrders: pendingOrders
  };
}

async function getLowStock(threshold) {
  // Since Mennyiseg is in Raktar, we need to sum up stock for each Ruha?
  // Or just find Raktar entries with low stock? 
  // Probably total stock per Ruha.
  // Query Raktar, group by Cikkszam, having sum(Mennyiseg) <= threshold?

  // Sequelize doesn't make HAVING SUM easy with includes sometimes. 
  // Simpler approach: Find all Raktar entries, group by Cikkszam.

  const lowStockItems = await models.Raktar.findAll({
    attributes: [
      "Cikkszam",
      [sequelize.fn("SUM", sequelize.col("Mennyiseg")), "totalDt"]
    ],
    group: ["Raktar.Cikkszam"],
    having: sequelize.where(sequelize.fn("SUM", sequelize.col("Mennyiseg")), "<=", threshold),
    include: [{ model: models.Ruha, attributes: ["Fajta", "Szin", "Meret"] }]
  });

  // Map to flat structure if needed or return hierarchal?
  // API expects array of Ruha objects with Mennyiseg?
  // Old API returned Ruha objects.
  // Let's flatten for compatibility or return what frontend handles.
  // Frontend likely expects: { Cikkszam, Fajta, Szin, Mennyiseg ... }

  return lowStockItems.map(item => ({
    Cikkszam: item.Cikkszam,
    Fajta: item.Ruha ? item.Ruha.Fajta : "Unknown",
    Szin: item.Ruha ? item.Ruha.Szin : "Unknown",
    Meret: item.Ruha ? item.Ruha.Meret : "Unknown",
    Mennyiseg: item.getDataValue("totalDt")
  }));
}

async function getRecentActivity(limit = 10) {
  const recentKibe = await models.RuhaKiBe.findAll({
    order: [["createdAt", "DESC"]],
    limit,
    include: [models.Dolgozo, models.Ruha],
  });

  // Format activity items for frontend
  const activities = recentKibe.map(kibe => ({
    user: kibe.Dolgozo ? kibe.Dolgozo.DNev : 'Ismeretlen',
    action: kibe.VisszaDatum ? 'Visszavétel' : 'Kiadás',
    item: kibe.Ruha ? `${kibe.Ruha.Fajta} (${kibe.Ruha.Meret})` : 'Ismeretlen ruha',
    date: new Date(kibe.createdAt).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }));

  return activities;
}

module.exports = { getStats, getLowStock, getRecentActivity };
