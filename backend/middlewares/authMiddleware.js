const authService = require('../services/authService');

/**
 * JWT token ellenőrző middleware
 * A token az x-auth-token header-ben várható
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ error: 'Hiányzó authentikációs token' });
    }

    const decoded = authService.verifyToken(token);
    req.user = {
      DolgozoID: decoded.DolgozoID,
      Szerepkor: decoded.Szerepkor
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Érvénytelen authentikációs token' });
  }
};

module.exports = authMiddleware;

