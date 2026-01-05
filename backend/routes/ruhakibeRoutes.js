const express = require('express');
const router = express.Router();
const ruhakibeController = require('../controllers/ruhakibeController');
const {
  createKiadásValidator,
  visszavetelValidator,
  ruhaKiBeIdValidator,
  dateRangeValidator
} = require('../validators/ruhakibeValidators');
const validationHandler = require('../middlewares/validationHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRoleMiddleware');

// GET /api/ruhakibe (Manager, Admin)
router.get('/',
  authMiddleware,
  requireRole('Manager'),
  ruhakibeController.getAll.bind(ruhakibeController)
);

// GET /api/ruhakibe/mine (Dolgozo, Manager, Admin)
router.get('/mine',
  authMiddleware,
  ruhakibeController.getMine.bind(ruhakibeController)
);

// GET /api/ruhakibe/active (Manager, Admin)
router.get('/active',
  authMiddleware,
  requireRole('Manager'),
  ruhakibeController.getActive.bind(ruhakibeController)
);

// GET /api/ruhakibe/returned (Manager, Admin)
router.get('/returned',
  authMiddleware,
  requireRole('Manager'),
  ruhakibeController.getReturned.bind(ruhakibeController)
);

// GET /api/ruhakibe/by-date (Manager, Admin)
router.get('/by-date',
  authMiddleware,
  requireRole('Manager'),
  dateRangeValidator,
  validationHandler,
  ruhakibeController.getByDate.bind(ruhakibeController)
);

// GET /api/ruhakibe/stats (Manager, Admin)
router.get('/stats',
  authMiddleware,
  requireRole('Manager'),
  ruhakibeController.getStats.bind(ruhakibeController)
);

// GET /api/ruhakibe/:ruhaKiBeId (Manager, Admin)
router.get('/:ruhaKiBeId',
  authMiddleware,
  requireRole('Manager'),
  ruhaKiBeIdValidator,
  validationHandler,
  ruhakibeController.getById.bind(ruhakibeController)
);

// POST /api/ruhakibe (Manager, Admin)
router.post('/',
  authMiddleware,
  requireRole('Manager'),
  createKiadásValidator,
  validationHandler,
  ruhakibeController.create.bind(ruhakibeController)
);

// PATCH /api/ruhakibe/:ruhaKiBeId (Manager, Admin)
router.patch('/:ruhaKiBeId',
  authMiddleware,
  requireRole('Manager'),
  visszavetelValidator,
  validationHandler,
  ruhakibeController.update.bind(ruhakibeController)
);

// DELETE /api/ruhakibe/:ruhaKiBeId (Admin)
router.delete('/:ruhaKiBeId',
  authMiddleware,
  requireRole('Admin'),
  ruhaKiBeIdValidator,
  validationHandler,
  ruhakibeController.delete.bind(ruhakibeController)
);

module.exports = router;

