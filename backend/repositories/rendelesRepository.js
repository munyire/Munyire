const { models } = require('../db');
const { Op } = require('sequelize');

class RendelesRepository {
  async findAll() {
    return await models.Rendeles.findAll({
      include: [{
        model: models.Ruha,
        as: 'ruha'
      }],
      order: [['RDatum', 'DESC']]
    });
  }

  async findById(rendelesId) {
    return await models.Rendeles.findByPk(rendelesId, {
      include: [{
        model: models.Ruha,
        as: 'ruha'
      }]
    });
  }

  async findPending() {
    return await models.Rendeles.findAll({
      where: { Statusz: 'Leadva' },
      include: [{
        model: models.Ruha,
        as: 'ruha'
      }],
      order: [['RDatum', 'ASC']]
    });
  }

  async findByStatus(statusz) {
    return await models.Rendeles.findAll({
      where: { Statusz: statusz },
      include: [{
        model: models.Ruha,
        as: 'ruha'
      }],
      order: [['RDatum', 'DESC']]
    });
  }

  async findByRuhaId(ruhaId) {
    return await models.Rendeles.findAll({
      where: { RuhaID: ruhaId },
      include: [{
        model: models.Ruha,
        as: 'ruha'
      }],
      order: [['RDatum', 'DESC']]
    });
  }

  async create(rendelesData) {
    return await models.Rendeles.create(rendelesData);
  }

  async update(rendelesId, updateData) {
    const rendeles = await models.Rendeles.findByPk(rendelesId);
    if (!rendeles) return null;
    
    await rendeles.update(updateData);
    return rendeles.reload({
      include: [{
        model: models.Ruha,
        as: 'ruha'
      }]
    });
  }

  async delete(rendelesId) {
    const rendeles = await models.Rendeles.findByPk(rendelesId);
    if (!rendeles) return false;
    
    await rendeles.destroy();
    return true;
  }
}

module.exports = new RendelesRepository();

