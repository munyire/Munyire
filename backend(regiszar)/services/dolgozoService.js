const dolgozoRepository = require('../repositories/dolgozoRepository');

class DolgozoService {
  async getAllDolgozok() {
    return await dolgozoRepository.findAll();
  }

  async getDolgozoById(dolgozoId) {
    const dolgozo = await dolgozoRepository.findById(dolgozoId);
    if (!dolgozo) {
      throw new Error('Dolgozó nem található');
    }
    return dolgozo;
  }

  async updateDolgozo(dolgozoId, updateData) {
    const dolgozo = await dolgozoRepository.update(dolgozoId, updateData);
    if (!dolgozo) {
      throw new Error('Dolgozó nem található');
    }
    return dolgozo;
  }

  async deleteDolgozo(dolgozoId) {
    const deleted = await dolgozoRepository.delete(dolgozoId);
    if (!deleted) {
      throw new Error('Dolgozó nem található');
    }
    return { message: 'Dolgozó sikeresen törölve' };
  }

  async getDolgozoRuhak(dolgozoId) {
    return await dolgozoRepository.getRuhak(dolgozoId);
  }

  async getDolgozoAktivRuhak(dolgozoId) {
    return await dolgozoRepository.getAktivRuhak(dolgozoId);
  }

  async getDolgozokWithActiveItems() {
    return await dolgozoRepository.findWithActiveItems();
  }
}

module.exports = new DolgozoService();

