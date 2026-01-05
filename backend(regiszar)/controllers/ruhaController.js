const ruhaService = require('../services/ruhaService');

class RuhaController {
  async getAll(req, res, next) {
    try {
      const ruhak = await ruhaService.getAllRuhak();
      res.json(ruhak);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const ruha = await ruhaService.getRuhaById(parseInt(req.params.ruhaId));
      res.json(ruha);
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const ruhak = await ruhaService.searchRuhak(req.query.q);
      res.json(ruhak);
    } catch (error) {
      next(error);
    }
  }

  async getByCikkszam(req, res, next) {
    try {
      const ruha = await ruhaService.getRuhaByCikkszam(req.params.cikkszam);
      res.json(ruha);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const ruha = await ruhaService.createRuha(req.body);
      res.status(201).json(ruha);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const ruha = await ruhaService.updateRuha(parseInt(req.params.ruhaId), req.body);
      res.json(ruha);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await ruhaService.deleteRuha(parseInt(req.params.ruhaId));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await ruhaService.getRuhaHistory(parseInt(req.params.ruhaId));
      res.json(history);
    } catch (error) {
      next(error);
    }
  }

  async getActive(req, res, next) {
    try {
      const active = await ruhaService.getRuhaActive(parseInt(req.params.ruhaId));
      res.json(active);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RuhaController();

