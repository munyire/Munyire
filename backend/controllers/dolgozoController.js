const dolgozoService = require('../services/dolgozoService');

class DolgozoController {
  async getAll(req, res, next) {
    try {
      const dolgozok = await dolgozoService.getAllDolgozok();
      res.json(dolgozok);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const dolgozo = await dolgozoService.getDolgozoById(parseInt(req.params.dolgozoId));
      res.json(dolgozo);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const dolgozo = await dolgozoService.updateDolgozo(parseInt(req.params.dolgozoId), req.body);
      res.json(dolgozo);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await dolgozoService.deleteDolgozo(parseInt(req.params.dolgozoId));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRuhak(req, res, next) {
    try {
      const ruhak = await dolgozoService.getDolgozoRuhak(parseInt(req.params.dolgozoId));
      res.json(ruhak);
    } catch (error) {
      next(error);
    }
  }

  async getAktivRuhak(req, res, next) {
    try {
      const ruhak = await dolgozoService.getDolgozoAktivRuhak(parseInt(req.params.dolgozoId));
      res.json(ruhak);
    } catch (error) {
      next(error);
    }
  }

  async getWithActiveItems(req, res, next) {
    try {
      const dolgozok = await dolgozoService.getDolgozokWithActiveItems();
      res.json(dolgozok);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DolgozoController();

