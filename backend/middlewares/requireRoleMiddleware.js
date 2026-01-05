const { hasMinimumRole } = require('../utils/roles');

/**
 * Szerepkör ellenőrző middleware factory
 * @param {string} minRole - Minimum szükséges szerepkör (Dolgozo, Manager, Admin)
 * @returns {Function} Middleware függvény
 */
const requireRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Nincs authentikáció' });
    }

    if (!hasMinimumRole(req.user.Szerepkor, minRole)) {
      return res.status(403).json({ 
        error: 'Nincs megfelelő jogosultság',
        details: `Szükséges szerepkör: ${minRole} vagy magasabb`
      });
    }

    next();
  };
};

module.exports = requireRole;

