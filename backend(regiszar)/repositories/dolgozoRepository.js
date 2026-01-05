const { models } = require('../db');

class DolgozoRepository {
  async findAll() {
    return await models.Dolgozo.findAll({
      attributes: { exclude: ['JelszoHash'] },
      order: [['DNev', 'ASC']]
    });
  }

  async findById(dolgozoId) {
    return await models.Dolgozo.findByPk(dolgozoId, {
      attributes: { exclude: ['JelszoHash'] }
    });
  }

  async findByFelhasznaloNev(felhasznaloNev) {
    return await models.Dolgozo.findOne({
      where: { FelhasznaloNev: felhasznaloNev }
    });
  }

  async create(dolgozoData) {
    return await models.Dolgozo.create(dolgozoData);
  }

  async update(dolgozoId, updateData) {
    const dolgozo = await models.Dolgozo.findByPk(dolgozoId);
    if (!dolgozo) return null;
    
    await dolgozo.update(updateData);
    return dolgozo.reload({ attributes: { exclude: ['JelszoHash'] } });
  }

  async delete(dolgozoId) {
    const dolgozo = await models.Dolgozo.findByPk(dolgozoId);
    if (!dolgozo) return false;
    
    await dolgozo.destroy();
    return true;
  }

  async findWithActiveItems() {
    return await models.Dolgozo.findAll({
      attributes: { exclude: ['JelszoHash'] },
      include: [{
        model: models.RuhaKiBe,
        as: 'ruhakibe',
        where: { VisszaDatum: null },
        required: true,
        include: [{
          model: models.Ruha,
          as: 'ruha'
        }]
      }]
    });
  }

  async getRuhak(dolgozoId) {
    return await models.RuhaKiBe.findAll({
      where: { DolgozoID: dolgozoId },
      include: [{
        model: models.Ruha,
        as: 'ruha'
      }],
      order: [['KiadasDatum', 'DESC']]
    });
  }

  async getAktivRuhak(dolgozoId) {
    return await models.RuhaKiBe.findAll({
      where: {
        DolgozoID: dolgozoId,
        VisszaDatum: null
      },
      include: [{
        model: models.Ruha,
        as: 'ruha'
      }],
      order: [['KiadasDatum', 'DESC']]
    });
  }
}

module.exports = new DolgozoRepository();

