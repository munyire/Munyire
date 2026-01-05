const authService = require('../services/authService');

class AuthController {
  async login(req, res, next) {
    try {
      const { FelhasznaloNev, Jelszo } = req.body;
      const result = await authService.login(FelhasznaloNev, Jelszo);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      // Ha van már admin, akkor szükséges az admin jogosultság (req.user létezik)
      const requireAdmin = !!req.user;
      const dolgozo = await authService.register(req.body, requireAdmin);
      res.status(201).json(dolgozo);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

