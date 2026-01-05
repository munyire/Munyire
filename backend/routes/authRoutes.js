const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginValidator, registerValidator } = require('../validators/authValidators');
const validationHandler = require('../middlewares/validationHandler');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const requireRole = require('../middlewares/requireRoleMiddleware');

// POST /api/auth/login
router.post('/login', loginValidator, validationHandler, authController.login.bind(authController));

// POST /api/auth/register (Admin only, vagy első admin létrehozása)
// Az optionalAuthMiddleware ellenőrzi, hogy van-e admin, és ha nincs, akkor átugorja az auth-t
// A requireRole csak akkor fut le, ha van req.user (tehát ha volt auth)
router.post('/register', 
  optionalAuthMiddleware,
  (req, res, next) => {
    // Ha nincs req.user, akkor az optionalAuthMiddleware átugrotta az auth-t (első admin)
    // Ebben az esetben ne futtassuk le a requireRole-t
    if (!req.user) {
      return next(); // Első admin létrehozása - nincs szerepkör ellenőrzés
    }
    // Van req.user - futtassuk le a requireRole-t
    return requireRole('Admin')(req, res, next);
  },
  registerValidator,
  validationHandler,
  authController.register.bind(authController)
);

module.exports = router;
