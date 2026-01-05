const authMiddleware = require('./authMiddleware');
const requireRole = require('./requireRoleMiddleware');

/**
 * Opcionális auth middleware - csak akkor ellenőrzi az auth-t, ha van már admin az adatbázisban
 * Használat: első admin létrehozásához
 */
const optionalAuthMiddleware = async (req, res, next) => {
  const { models } = require('../db');
  
  try {
    const adminCount = await models.Dolgozo.count({ where: { Szerepkor: 'Admin' } });
    
    if (adminCount === 0 && req.body && req.body.Szerepkor === 'Admin') {
      // Nincs még admin, és első admin-t hozzuk létre - nincs auth szükséges
      return next();
    } else {
      // Van már admin vagy nem admin-t hozunk létre - szükséges az auth
      return authMiddleware(req, res, next);
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = optionalAuthMiddleware;
