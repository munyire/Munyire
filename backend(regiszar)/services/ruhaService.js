const ruhaRepository = require('../repositories/ruhaRepository');

class RuhaService {
  async getAllRuhak() {
    return await ruhaRepository.findAll();
  }

  async getRuhaById(ruhaId) {
    const ruha = await ruhaRepository.findById(ruhaId);
    if (!ruha) {
      throw new Error('Ruhacikk nem található');
    }
    return ruha;
  }

  async searchRuhak(query) {
    return await ruhaRepository.search(query);
  }

  async getRuhaByCikkszam(cikkszam) {
    const ruha = await ruhaRepository.findByCikkszam(cikkszam);
    if (!ruha) {
      throw new Error('Ruhacikk nem található');
    }
    return ruha;
  }

  async createRuha(ruhaData) {
    // Ellenőrizzük, hogy létezik-e már ilyen cikkszám
    const existing = await ruhaRepository.findByCikkszam(ruhaData.Cikkszam);
    if (existing) {
      throw new Error('A cikkszám már létezik');
    }

    return await ruhaRepository.create(ruhaData);
  }

  async updateRuha(ruhaId, updateData) {
    // Ha cikkszám módosítás történik, ellenőrizzük az egyediséget
    if (updateData.Cikkszam) {
      const existing = await ruhaRepository.findByCikkszam(updateData.Cikkszam);
      if (existing && existing.RuhaID !== ruhaId) {
        throw new Error('A cikkszám már létezik');
      }
    }

    const ruha = await ruhaRepository.update(ruhaId, updateData);
    if (!ruha) {
      throw new Error('Ruhacikk nem található');
    }
    return ruha;
  }

  async deleteRuha(ruhaId) {
    const deleted = await ruhaRepository.delete(ruhaId);
    if (!deleted) {
      throw new Error('Ruhacikk nem található');
    }
    return { message: 'Ruhacikk sikeresen törölve' };
  }

  async getRuhaHistory(ruhaId) {
    await this.getRuhaById(ruhaId); // Ellenőrizzük, hogy létezik-e
    return await ruhaRepository.getHistory(ruhaId);
  }

  async getRuhaActive(ruhaId) {
    await this.getRuhaById(ruhaId); // Ellenőrizzük, hogy létezik-e
    return await ruhaRepository.getActive(ruhaId);
  }

  async getLowStock(threshold = 10) {
    return await ruhaRepository.findLowStock(threshold);
  }
}

module.exports = new RuhaService();

