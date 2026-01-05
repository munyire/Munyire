const express = require('express');
const router = express.Router();
const dolgozoController = require('../controllers/dolgozoController');
const { updateDolgozoValidator, dolgozoIdValidator } = require('../validators/dolgozoValidators');
const validationHandler = require('../middlewares/validationHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRoleMiddleware');
const requireSelfOrRole = require('../middlewares/requireSelfOrRoleMiddleware');

// GET /api/dolgozok (Manager, Admin)
router.get('/', 
  authMiddleware,
  requireRole('Manager'),
  dolgozoController.getAll.bind(dolgozoController)
);

// GET /api/dolgozok/with-active-items (Manager, Admin)
router.get('/with-active-items',
  authMiddleware,
  requireRole('Manager'),
  dolgozoController.getWithActiveItems.bind(dolgozoController)
);

// GET /api/dolgozok/:dolgozoId (Dolgozo saját, Manager, Admin)
router.get('/:dolgozoId',
  authMiddleware,
  dolgozoIdValidator,
  validationHandler,
  requireSelfOrRole('Manager'),
  dolgozoController.getById.bind(dolgozoController)
);

// PATCH /api/dolgozok/:dolgozoId (Admin)
router.patch('/:dolgozoId',
  authMiddleware,
  requireRole('Admin'),
  updateDolgozoValidator,
  validationHandler,
  dolgozoController.update.bind(dolgozoController)
);

// DELETE /api/dolgozok/:dolgozoId (Admin)
router.delete('/:dolgozoId',
  authMiddleware,
  requireRole('Admin'),
  dolgozoIdValidator,
  validationHandler,
  dolgozoController.delete.bind(dolgozoController)
);

// GET /api/dolgozok/:dolgozoId/ruhak (Dolgozo saját, Manager, Admin)
router.get('/:dolgozoId/ruhak',
  authMiddleware,
  dolgozoIdValidator,
  validationHandler,
  requireSelfOrRole('Manager'),
  dolgozoController.getRuhak.bind(dolgozoController)
);

// GET /api/dolgozok/:dolgozoId/ruhak/aktiv (Dolgozo saját, Manager, Admin)
router.get('/:dolgozoId/ruhak/aktiv',
  authMiddleware,
  dolgozoIdValidator,
  validationHandler,
  requireSelfOrRole('Manager'),
  dolgozoController.getAktivRuhak.bind(dolgozoController)
);

module.exports = router;

