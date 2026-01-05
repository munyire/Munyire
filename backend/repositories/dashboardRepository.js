const { models } = require('../db');
const { Op } = require('sequelize');

class DashboardRepository {
  async getStats() {
    const osszesRuhaTipus = await models.Ruha.count();
    const osszesKeszlet = await models.Ruha.sum('Mennyiseg') || 0;
    const aktivKiadasok = await models.RuhaKiBe.count({
      where: { VisszaDatum: null }
    });
    const osszesDolgozo = await models.Dolgozo.count();
    const fuggoRendelesek = await models.Rendeles.count({
      where: { Statusz: 'Leadva' }
    });

    return {
      osszesRuhaTipus,
      osszesKeszlet,
      aktivKiadasok,
      osszesDolgozo,
      fuggoRendelesek
    };
  }

  async getLowStock(threshold = 10) {
    return await models.Ruha.findAll({
      where: {
        Mennyiseg: { [Op.lt]: threshold }
      },
      order: [['Mennyiseg', 'ASC']],
      limit: 20
    });
  }

  async getRecentActivity(limit = 10) {
    const kiadasok = await models.RuhaKiBe.findAll({
      where: { VisszaDatum: null },
      include: [
        {
          model: models.Dolgozo,
          as: 'dolgozo',
          attributes: ['DNev']
        },
        {
          model: models.Ruha,
          as: 'ruha',
          attributes: ['Cikkszam', 'Fajta']
        }
      ],
      order: [['KiadasDatum', 'DESC']],
      limit
    });

    const visszavetelek = await models.RuhaKiBe.findAll({
      where: { VisszaDatum: { [Op.ne]: null } },
      include: [
        {
          model: models.Dolgozo,
          as: 'dolgozo',
          attributes: ['DNev']
        },
        {
          model: models.Ruha,
          as: 'ruha',
          attributes: ['Cikkszam', 'Fajta']
        }
      ],
      order: [['VisszaDatum', 'DESC']],
      limit
    });

    return {
      kiadasok,
      visszavetelek
    };
  }
}

module.exports = new DashboardRepository();

