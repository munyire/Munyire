const { models } = require('../db');
const { Op } = require('sequelize');

class RuhaRepository {
  async findAll() {
    return await models.Ruha.findAll({
      order: [['Cikkszam', 'ASC']]
    });
  }

  async findById(ruhaId) {
    return await models.Ruha.findByPk(ruhaId);
  }

  async findByCikkszam(cikkszam) {
    return await models.Ruha.findOne({
      where: { Cikkszam: cikkszam }
    });
  }

  async search(query) {
    return await models.Ruha.findAll({
      where: {
        [Op.or]: [
          { Cikkszam: { [Op.like]: `%${query}%` } },
          { Fajta: { [Op.like]: `%${query}%` } },
          { Szin: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [['Cikkszam', 'ASC']]
    });
  }

  async create(ruhaData) {
    return await models.Ruha.create(ruhaData);
  }

  async update(ruhaId, updateData) {
    const ruha = await models.Ruha.findByPk(ruhaId);
    if (!ruha) return null;
    
    await ruha.update(updateData);
    return ruha.reload();
  }

  async delete(ruhaId) {
    const ruha = await models.Ruha.findByPk(ruhaId);
    if (!ruha) return false;
    
    await ruha.destroy();
    return true;
  }

  async getHistory(ruhaId) {
    return await models.RuhaKiBe.findAll({
      where: { RuhaID: ruhaId },
      include: [{
        model: models.Dolgozo,
        as: 'dolgozo',
        attributes: ['DolgozoID', 'DNev']
      }],
      order: [['KiadasDatum', 'DESC']]
    });
  }

  async getActive(ruhaId) {
    return await models.RuhaKiBe.findAll({
      where: {
        RuhaID: ruhaId,
        VisszaDatum: null
      },
      include: [{
        model: models.Dolgozo,
        as: 'dolgozo',
        attributes: ['DolgozoID', 'DNev']
      }],
      order: [['KiadasDatum', 'DESC']]
    });
  }

  async findLowStock(threshold = 10) {
    return await models.Ruha.findAll({
      where: {
        Mennyiseg: { [Op.lt]: threshold }
      },
      order: [['Mennyiseg', 'ASC']]
    });
  }
}

module.exports = new RuhaRepository();

