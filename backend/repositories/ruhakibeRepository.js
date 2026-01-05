const { models } = require('../db');
const { Op } = require('sequelize');

class RuhaKiBeRepository {
  async findAll() {
    return await models.RuhaKiBe.findAll({
      include: [
        {
          model: models.Dolgozo,
          as: 'dolgozo',
          attributes: ['DolgozoID', 'DNev', 'Munkakor']
        },
        {
          model: models.Ruha,
          as: 'ruha'
        }
      ],
      order: [['KiadasDatum', 'DESC']]
    });
  }

  async findById(ruhaKiBeId) {
    return await models.RuhaKiBe.findByPk(ruhaKiBeId, {
      include: [
        {
          model: models.Dolgozo,
          as: 'dolgozo',
          attributes: ['DolgozoID', 'DNev', 'Munkakor']
        },
        {
          model: models.Ruha,
          as: 'ruha'
        }
      ]
    });
  }

  async findByDolgozoId(dolgozoId) {
    return await models.RuhaKiBe.findAll({
      where: { DolgozoID: dolgozoId },
      include: [{
        model: models.Ruha,
        as: 'ruha'
      }],
      order: [['KiadasDatum', 'DESC']]
    });
  }

  async findActive() {
    return await models.RuhaKiBe.findAll({
      where: { VisszaDatum: null },
      include: [
        {
          model: models.Dolgozo,
          as: 'dolgozo',
          attributes: ['DolgozoID', 'DNev', 'Munkakor']
        },
        {
          model: models.Ruha,
          as: 'ruha'
        }
      ],
      order: [['KiadasDatum', 'DESC']]
    });
  }

  async findReturned() {
    return await models.RuhaKiBe.findAll({
      where: { VisszaDatum: { [Op.ne]: null } },
      include: [
        {
          model: models.Dolgozo,
          as: 'dolgozo',
          attributes: ['DolgozoID', 'DNev', 'Munkakor']
        },
        {
          model: models.Ruha,
          as: 'ruha'
        }
      ],
      order: [['VisszaDatum', 'DESC']]
    });
  }

  async findByDateRange(from, to) {
    return await models.RuhaKiBe.findAll({
      where: {
        KiadasDatum: {
          [Op.between]: [from, to]
        }
      },
      include: [
        {
          model: models.Dolgozo,
          as: 'dolgozo',
          attributes: ['DolgozoID', 'DNev']
        },
        {
          model: models.Ruha,
          as: 'ruha'
        }
      ],
      order: [['KiadasDatum', 'DESC']]
    });
  }

  async create(ruhaKiBeData, options = {}) {
    return await models.RuhaKiBe.create(ruhaKiBeData, options);
  }

  async update(ruhaKiBeId, updateData) {
    const ruhaKiBe = await models.RuhaKiBe.findByPk(ruhaKiBeId);
    if (!ruhaKiBe) return null;
    
    await ruhaKiBe.update(updateData);
    return ruhaKiBe.reload({
      include: [
        {
          model: models.Dolgozo,
          as: 'dolgozo',
          attributes: ['DolgozoID', 'DNev']
        },
        {
          model: models.Ruha,
          as: 'ruha'
        }
      ]
    });
  }

  async delete(ruhaKiBeId) {
    const ruhaKiBe = await models.RuhaKiBe.findByPk(ruhaKiBeId);
    if (!ruhaKiBe) return false;
    
    await ruhaKiBe.destroy();
    return true;
  }

  async getStats() {
    const osszesKiadas = await models.RuhaKiBe.count();
    const osszesVisszavetel = await models.RuhaKiBe.count({
      where: { VisszaDatum: { [Op.ne]: null } }
    });
    const aktivKiadasok = await models.RuhaKiBe.count({
      where: { VisszaDatum: null }
    });

    // Havi statisztikák
    const havi = {};
    const tranzakciok = await models.RuhaKiBe.findAll({
      attributes: ['KiadasDatum', 'VisszaDatum']
    });

    tranzakciok.forEach(t => {
      const date = new Date(t.KiadasDatum);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!havi[key]) {
        havi[key] = { kiadas: 0, visszavetel: 0 };
      }
      havi[key].kiadas++;
      if (t.VisszaDatum) {
        havi[key].visszavetel++;
      }
    });

    return {
      osszesKiadas,
      osszesVisszavetel,
      aktivKiadasok,
      havi
    };
  }
}

module.exports = new RuhaKiBeRepository();

