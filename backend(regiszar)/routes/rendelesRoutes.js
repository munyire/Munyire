const express = require('express');
const router = express.Router();
const rendelesController = require('../controllers/rendelesController');
const {
  createRendelesValidator,
  updateRendelesValidator,
  rendelesIdValidator,
  statuszValidator,
  ruhaIdValidator
} = require('../validators/rendelesValidators');
const validationHandler = require('../middlewares/validationHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRoleMiddleware');

// GET /api/rendelesek (Manager, Admin)
router.get('/',
  authMiddleware,
  requireRole('Manager'),
  rendelesController.getAll.bind(rendelesController)
);

// GET /api/rendelesek/pending (Manager, Admin)
router.get('/pending',
  authMiddleware,
  requireRole('Manager'),
  rendelesController.getPending.bind(rendelesController)
);

// GET /api/rendelesek/by-status/:statusz (Manager, Admin)
router.get('/by-status/:statusz',
  authMiddleware,
  requireRole('Manager'),
  statuszValidator,
  validationHandler,
  rendelesController.getByStatus.bind(rendelesController)
);

// GET /api/rendelesek/by-ruha/:ruhaId (Manager, Admin)
router.get('/by-ruha/:ruhaId',
  authMiddleware,
  requireRole('Manager'),
  ruhaIdValidator,
  validationHandler,
  rendelesController.getByRuha.bind(rendelesController)
);

// GET /api/rendelesek/:rendelesId (Manager, Admin)
router.get('/:rendelesId',
  authMiddleware,
  requireRole('Manager'),
  rendelesIdValidator,
  validationHandler,
  rendelesController.getById.bind(rendelesController)
);

// POST /api/rendelesek (Manager, Admin)
router.post('/',
  authMiddleware,
  requireRole('Manager'),
  createRendelesValidator,
  validationHandler,
  rendelesController.create.bind(rendelesController)
);

// PATCH /api/rendelesek/:rendelesId (Manager, Admin)
router.patch('/:rendelesId',
  authMiddleware,
  requireRole('Manager'),
  updateRendelesValidator,
  validationHandler,
  rendelesController.update.bind(rendelesController)
);

// PATCH /api/rendelesek/:rendelesId/complete (Admin)
router.patch('/:rendelesId/complete',
  authMiddleware,
  requireRole('Admin'),
  rendelesIdValidator,
  validationHandler,
  rendelesController.complete.bind(rendelesController)
);

// DELETE /api/rendelesek/:rendelesId (Admin)
router.delete('/:rendelesId',
  authMiddleware,
  requireRole('Admin'),
  rendelesIdValidator,
  validationHandler,
  rendelesController.delete.bind(rendelesController)
);

module.exports = router;

