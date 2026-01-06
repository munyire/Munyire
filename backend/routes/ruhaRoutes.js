const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRoleMiddleware");
const { ROLES } = require("../utils/roles");
const validationHandler = require("../middlewares/validationHandler");
const { createRuha, updateRuha } = require("../validators/ruhaValidators");
const controller = require("../controllers/ruhaController");

router.use(auth);

// Készlet listázása
router.get("/", requireRole(ROLES.Manager), controller.list);

// Keresés q paraméterrel
router.get("/search", requireRole(ROLES.Manager), controller.search);

// Cikkszám alapú keresés
router.get("/by-cikkszam/:cikkszam", requireRole(ROLES.Manager), controller.getByCikkszam);

// Egy ruhacikk részletei
router.get("/:ruhaId", requireRole(ROLES.Manager), controller.get);

// Ruhacikk kiadási története
router.get("/:ruhaId/history", requireRole(ROLES.Manager), controller.history);

// Ruhacikkből kint lévő kiadások
router.get("/:ruhaId/active", requireRole(ROLES.Manager), controller.active);

// Új ruhacikk felvétele
router.post("/", requireRole(ROLES.Admin), createRuha, validationHandler, controller.create);

// Ruhacikk módosítása
router.patch("/:ruhaId", requireRole(ROLES.Admin), updateRuha, validationHandler, controller.update);

// Ruhacikk törlése
router.delete("/:ruhaId", requireRole(ROLES.Admin), controller.remove);

module.exports = router;
