const ruhakibeService = require('../services/ruhakibeService');

class RuhaKiBeController {
  async getAll(req, res, next) {
    try {
      const tranzakciok = await ruhakibeService.getAllTranzakciok();
      res.json(tranzakciok);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const tranzakcio = await ruhakibeService.getTranzakcioById(parseInt(req.params.ruhaKiBeId));
      res.json(tranzakcio);
    } catch (error) {
      next(error);
    }
  }

  async getMine(req, res, next) {
    try {
      const tranzakciok = await ruhakibeService.getMineTranzakciok(req.user.DolgozoID);
      res.json(tranzakciok);
    } catch (error) {
      next(error);
    }
  }

  async getActive(req, res, next) {
    try {
      const tranzakciok = await ruhakibeService.getActiveTranzakciok();
      res.json(tranzakciok);
    } catch (error) {
      next(error);
    }
  }

  async getReturned(req, res, next) {
    try {
      const tranzakciok = await ruhakibeService.getReturnedTranzakciok();
      res.json(tranzakciok);
    } catch (error) {
      next(error);
    }
  }

  async getByDate(req, res, next) {
    try {
      const result = await ruhakibeService.getTranzakciokByDate(req.query.from, req.query.to);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await ruhakibeService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const tranzakcio = await ruhakibeService.createKiadás(req.body);
      res.status(201).json(tranzakcio);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const tranzakcio = await ruhakibeService.createVisszavetel(
        parseInt(req.params.ruhaKiBeId),
        req.body
      );
      res.json(tranzakcio);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await ruhakibeService.deleteTranzakcio(parseInt(req.params.ruhaKiBeId));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RuhaKiBeController();

