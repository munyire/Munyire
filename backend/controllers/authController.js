const authService = require("../services/authService");

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ id: user.DolgozoID, username: user.FelhasznaloNev, role: user.Szerepkor });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { token, user } = await authService.login(req.body);
    res.json({
      token,
      user: {
        id: user.DolgozoID,
        name: user.DNev,
        role: user.Szerepkor,
        username: user.FelhasznaloNev,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
