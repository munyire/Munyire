const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRoleMiddleware");
const { ROLES } = require("../utils/roles");
const validationHandler = require("../middlewares/validationHandler");
const { createRendeles, updateRendeles } = require("../validators/rendelesValidators");
const controller = require("../controllers/rendelesController");

router.use(auth);

// Összes rendelés
router.get("/", requireRole(ROLES.Manager), controller.list);

// Függőben lévő rendelések
router.get("/pending", requireRole(ROLES.Manager), controller.listPending);

// Rendelések státusz szerint
router.get("/by-status/:statusz", requireRole(ROLES.Manager), controller.listByStatus);

// Rendelések ruhacikk szerint
router.get("/by-ruha/:ruhaId", requireRole(ROLES.Manager), controller.listByRuha);

// Egy rendelés részletei
router.get("/:rendelesId", requireRole(ROLES.Manager), controller.get);

// Új rendelés létrehozása
router.post("/", requireRole(ROLES.Manager), createRendeles, validationHandler, controller.create);

// ACTION: Rendelés leadása (Alias)
router.post("/place", requireRole(ROLES.Manager), createRendeles, validationHandler, controller.create);

// Rendelés módosítása
router.patch(
  "/:rendelesId",
  requireRole(ROLES.Manager),
  updateRendeles,
  validationHandler,
  controller.update
);

// Rendelés teljesítése + készlet növelés
router.patch("/:rendelesId/complete", requireRole(ROLES.Admin), controller.complete);

// Rendelés törlése
router.delete("/:rendelesId", requireRole(ROLES.Admin), controller.remove);

module.exports = router;
