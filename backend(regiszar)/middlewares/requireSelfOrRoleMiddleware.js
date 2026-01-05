const { hasMinimumRole } = require('../utils/roles');

/**
 * Szerepkör ellenőrző middleware factory - saját adat VAGY megfelelő szerepkör
 * @param {string} minRole - Minimum szükséges szerepkör (Manager, Admin)
 * @returns {Function} Middleware függvény
 */
const requireSelfOrRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Nincs authentikáció' });
    }

    // Különböző paraméter neveket támogat (dolgozoId, id, stb.)
    const requestedId = parseInt(
      req.params.dolgozoId || 
      req.params.id || 
      req.body.DolgozoID ||
      0
    );
    const userId = req.user.DolgozoID;

    // Ha saját adat, akkor engedélyezett
    if (requestedId === userId) {
      return next();
    }

    // Ha nem saját adat, akkor szerepkör ellenőrzés
    if (!hasMinimumRole(req.user.Szerepkor, minRole)) {
      return res.status(403).json({ 
        error: 'Nincs jogosultság',
        details: 'Csak saját adataidat érheted el, vagy szükséges szerepkör: ' + minRole
      });
    }

    next();
  };
};

module.exports = requireSelfOrRole;

