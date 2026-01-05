const rendelesService = require('../services/rendelesService');

class RendelesController {
  async getAll(req, res, next) {
    try {
      const rendelesek = await rendelesService.getAllRendelesek();
      res.json(rendelesek);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const rendeles = await rendelesService.getRendelesById(parseInt(req.params.rendelesId));
      res.json(rendeles);
    } catch (error) {
      next(error);
    }
  }

  async getPending(req, res, next) {
    try {
      const rendelesek = await rendelesService.getPendingRendelesek();
      res.json(rendelesek);
    } catch (error) {
      next(error);
    }
  }

  async getByStatus(req, res, next) {
    try {
      const rendelesek = await rendelesService.getRendelesekByStatus(req.params.statusz);
      res.json(rendelesek);
    } catch (error) {
      next(error);
    }
  }

  async getByRuha(req, res, next) {
    try {
      const rendelesek = await rendelesService.getRendelesekByRuha(parseInt(req.params.ruhaId));
      res.json(rendelesek);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const rendeles = await rendelesService.createRendeles(req.body);
      res.status(201).json(rendeles);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const rendeles = await rendelesService.updateRendeles(parseInt(req.params.rendelesId), req.body);
      res.json(rendeles);
    } catch (error) {
      next(error);
    }
  }

  async complete(req, res, next) {
    try {
      const result = await rendelesService.completeRendeles(parseInt(req.params.rendelesId));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await rendelesService.deleteRendeles(parseInt(req.params.rendelesId));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RendelesController();

