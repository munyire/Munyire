const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRoleMiddleware");
const { ROLES } = require("../utils/roles");
const validationHandler = require("../middlewares/validationHandler");
const { issueValidator, returnValidator } = require("../validators/ruhakibeValidators");
const controller = require("../controllers/ruhakibeController");

router.use(auth);

// Összes tranzakció
router.get("/", requireRole(ROLES.Manager), controller.list);

// Saját tranzakciók
router.get("/mine", controller.listMine);

// Aktív (kint lévő) kiadások
router.get("/active", requireRole(ROLES.Manager), controller.listActive);

// Lezárt (visszavett) tranzakciók
router.get("/returned", requireRole(ROLES.Manager), controller.listReturned);

// Időszak szerinti szűrés
router.get("/by-date", requireRole(ROLES.Manager), controller.listByDate);

// Statisztikák
router.get("/stats", requireRole(ROLES.Manager), controller.stats);

// Egy tranzakció részletei
router.get("/:ruhaKiBeId", requireRole(ROLES.Manager), controller.get);

// Új kiadás rögzítése
router.post("/", requireRole(ROLES.Manager), issueValidator, validationHandler, controller.create);

// Visszavétel rögzítése
router.patch(
  "/:ruhaKiBeId",
  requireRole(ROLES.Manager),
  returnValidator,
  validationHandler,
  controller.update
);

// Tranzakció törlése
router.delete("/:ruhaKiBeId", requireRole(ROLES.Admin), controller.remove);

module.exports = router;
