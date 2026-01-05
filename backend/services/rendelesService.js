const { sequelize } = require('../db');
const rendelesRepository = require('../repositories/rendelesRepository');
const ruhaRepository = require('../repositories/ruhaRepository');

class RendelesService {
  async getAllRendelesek() {
    return await rendelesRepository.findAll();
  }

  async getRendelesById(rendelesId) {
    const rendeles = await rendelesRepository.findById(rendelesId);
    if (!rendeles) {
      throw new Error('Rendelés nem található');
    }
    return rendeles;
  }

  async getPendingRendelesek() {
    return await rendelesRepository.findPending();
  }

  async getRendelesekByStatus(statusz) {
    return await rendelesRepository.findByStatus(statusz);
  }

  async getRendelesekByRuha(ruhaId) {
    return await rendelesRepository.findByRuhaId(ruhaId);
  }

  async createRendeles(rendelesData) {
    // Ellenőrizzük, hogy létezik-e a ruhacikk
    const ruha = await ruhaRepository.findById(rendelesData.RuhaID);
    if (!ruha) {
      throw new Error('Ruhacikk nem található');
    }

    return await rendelesRepository.create({
      ...rendelesData,
      RDatum: rendelesData.RDatum || new Date()
    });
  }

  async updateRendeles(rendelesId, updateData) {
    const rendeles = await rendelesRepository.update(rendelesId, updateData);
    if (!rendeles) {
      throw new Error('Rendelés nem található');
    }
    return rendeles;
  }

  async completeRendeles(rendelesId) {
    const transaction = await sequelize.transaction();

    try {
      const rendeles = await rendelesRepository.findById(rendelesId);
      if (!rendeles) {
        throw new Error('Rendelés nem található');
      }

      if (rendeles.Statusz !== 'Leadva') {
        throw new Error('Csak Leadva státuszú rendelés teljesíthető');
      }

      // Növeljük a készletet
      const ruha = await ruhaRepository.findById(rendeles.RuhaID);
      await ruha.update(
        { Mennyiseg: ruha.Mennyiseg + rendeles.Mennyiseg },
        { transaction }
      );

      // Frissítjük a státuszt
      await rendeles.update(
        { Statusz: 'Teljesítve' },
        { transaction }
      );

      await transaction.commit();

      const updatedRuha = await ruhaRepository.findById(rendeles.RuhaID);

      return {
        message: 'Rendelés teljesítve, készlet frissítve',
        RendelesID: rendeles.RendelesID,
        RuhaID: rendeles.RuhaID,
        hozzaadottMennyiseg: rendeles.Mennyiseg,
        ujKeszlet: updatedRuha.Mennyiseg
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteRendeles(rendelesId) {
    const deleted = await rendelesRepository.delete(rendelesId);
    if (!deleted) {
      throw new Error('Rendelés nem található');
    }
    return { message: 'Rendelés sikeresen törölve' };
  }
}

module.exports = new RendelesService();

