const { sequelize } = require('../db');
const ruhakibeRepository = require('../repositories/ruhakibeRepository');
const ruhaRepository = require('../repositories/ruhaRepository');

class RuhaKiBeService {
  async getAllTranzakciok() {
    return await ruhakibeRepository.findAll();
  }

  async getTranzakcioById(ruhaKiBeId) {
    const tranzakcio = await ruhakibeRepository.findById(ruhaKiBeId);
    if (!tranzakcio) {
      throw new Error('Tranzakció nem található');
    }
    return tranzakcio;
  }

  async getMineTranzakciok(dolgozoId) {
    return await ruhakibeRepository.findByDolgozoId(dolgozoId);
  }

  async getActiveTranzakciok() {
    return await ruhakibeRepository.findActive();
  }

  async getReturnedTranzakciok() {
    return await ruhakibeRepository.findReturned();
  }

  async getTranzakciokByDate(from, to) {
    const tranzakciok = await ruhakibeRepository.findByDateRange(from, to);
    const kiadasokSzama = tranzakciok.filter(t => t.KiadasDatum).length;
    const visszavetelekSzama = tranzakciok.filter(t => t.VisszaDatum).length;

    return {
      from,
      to,
      kiadasokSzama,
      visszavetelekSzama,
      tranzakciok
    };
  }

  async getStats() {
    return await ruhakibeRepository.getStats();
  }

  async createKiadás(kiadasData) {
    const transaction = await sequelize.transaction();

    try {
      // Ellenőrizzük a készletet
      const ruha = await ruhaRepository.findById(kiadasData.RuhaID);
      if (!ruha) {
        throw new Error('Ruhacikk nem található');
      }

      if (ruha.Mennyiseg < kiadasData.Mennyiseg) {
        throw new Error('Nincs elég készlet');
      }

      // Ellenőrizzük az indokot
      if (!kiadasData.Indok || kiadasData.Indok.length < 3) {
        throw new Error('Az indok megadása kötelező (minimum 3 karakter)');
      }

      // Csökkentjük a készletet
      await ruha.update(
        { Mennyiseg: ruha.Mennyiseg - kiadasData.Mennyiseg },
        { transaction }
      );

      // Létrehozzuk a kiadást
      const ruhaKiBe = await ruhakibeRepository.create({
        ...kiadasData,
        KiadasDatum: kiadasData.KiadasDatum || new Date()
      }, { transaction });

      await transaction.commit();

      return await ruhakibeRepository.findById(ruhaKiBe.RuhaKiBeID);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async createVisszavetel(ruhaKiBeId, visszavetelData) {
    const transaction = await sequelize.transaction();

    try {
      const ruhaKiBe = await ruhakibeRepository.findById(ruhaKiBeId);
      if (!ruhaKiBe) {
        throw new Error('Tranzakció nem található');
      }

      if (ruhaKiBe.VisszaDatum) {
        throw new Error('Ez a tranzakció már visszavéve');
      }

      // Növeljük a készletet
      const ruha = await ruhaRepository.findById(ruhaKiBe.RuhaID);
      await ruha.update(
        { Mennyiseg: ruha.Mennyiseg + ruhaKiBe.Mennyiseg },
        { transaction }
      );

      // Frissítjük a tranzakciót
      await ruhaKiBe.update({
        VisszaDatum: visszavetelData.VisszaDatum || new Date(),
        RuhaMinoseg: visszavetelData.RuhaMinoseg
      }, { transaction });

      await transaction.commit();

      return await ruhakibeRepository.findById(ruhaKiBeId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteTranzakcio(ruhaKiBeId) {
    const deleted = await ruhakibeRepository.delete(ruhaKiBeId);
    if (!deleted) {
      throw new Error('Tranzakció nem található');
    }
    return { message: 'Tranzakció sikeresen törölve' };
  }
}

module.exports = new RuhaKiBeService();

