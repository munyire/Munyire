const express = require('express');
const router = express.Router();
const ruhaController = require('../controllers/ruhaController');
const { 
  createRuhaValidator, 
  updateRuhaValidator, 
  ruhaIdValidator,
  searchValidator,
  cikkszamValidator
} = require('../validators/ruhaValidators');
const validationHandler = require('../middlewares/validationHandler');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRoleMiddleware');

// GET /api/ruhak (Manager, Admin)
router.get('/',
  authMiddleware,
  requireRole('Manager'),
  ruhaController.getAll.bind(ruhaController)
);

// GET /api/ruhak/search (Manager, Admin)
router.get('/search',
  authMiddleware,
  requireRole('Manager'),
  searchValidator,
  validationHandler,
  ruhaController.search.bind(ruhaController)
);

// GET /api/ruhak/by-cikkszam/:cikkszam (Manager, Admin)
router.get('/by-cikkszam/:cikkszam',
  authMiddleware,
  requireRole('Manager'),
  cikkszamValidator,
  validationHandler,
  ruhaController.getByCikkszam.bind(ruhaController)
);

// GET /api/ruhak/:ruhaId (Manager, Admin)
router.get('/:ruhaId',
  authMiddleware,
  requireRole('Manager'),
  ruhaIdValidator,
  validationHandler,
  ruhaController.getById.bind(ruhaController)
);

// POST /api/ruhak (Admin)
router.post('/',
  authMiddleware,
  requireRole('Admin'),
  createRuhaValidator,
  validationHandler,
  ruhaController.create.bind(ruhaController)
);

// PATCH /api/ruhak/:ruhaId (Admin)
router.patch('/:ruhaId',
  authMiddleware,
  requireRole('Admin'),
  updateRuhaValidator,
  validationHandler,
  ruhaController.update.bind(ruhaController)
);

// DELETE /api/ruhak/:ruhaId (Admin)
router.delete('/:ruhaId',
  authMiddleware,
  requireRole('Admin'),
  ruhaIdValidator,
  validationHandler,
  ruhaController.delete.bind(ruhaController)
);

// GET /api/ruhak/:ruhaId/history (Manager, Admin)
router.get('/:ruhaId/history',
  authMiddleware,
  requireRole('Manager'),
  ruhaIdValidator,
  validationHandler,
  ruhaController.getHistory.bind(ruhaController)
);

// GET /api/ruhak/:ruhaId/active (Manager, Admin)
router.get('/:ruhaId/active',
  authMiddleware,
  requireRole('Manager'),
  ruhaIdValidator,
  validationHandler,
  ruhaController.getActive.bind(ruhaController)
);

module.exports = router;

