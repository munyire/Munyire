const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRoleMiddleware");
const requireSelfOrRole = require("../middlewares/requireSelfOrRoleMiddleware");
const { ROLES } = require("../utils/roles");
const validationHandler = require("../middlewares/validationHandler");
const { createDolgozo, updateDolgozo } = require("../validators/dolgozoValidators");
const controller = require("../controllers/dolgozoController");

router.use(auth);

// Összes dolgozó (Manager/Admin)
router.get("/", requireRole(ROLES.Manager), controller.list);

// Összes dolgozó neve (Frontend dropdownokhoz - Manager/Admin)
router.get("/names", requireRole(ROLES.Manager), controller.listNames);

// Dolgozók, akiknek van kint ruhája (Manager/Admin)
router.get("/with-active-items", requireRole(ROLES.Manager), controller.listWithActiveItems);

// Egy dolgozó adatai (saját vagy Manager/Admin)
router.get("/:dolgozoId", requireSelfOrRole({ paramKey: "dolgozoId", role: ROLES.Manager }), controller.get);

// Dolgozó módosítása (Admin)
router.patch(
  "/:dolgozoId",
  requireRole(ROLES.Admin),
  updateDolgozo,
  validationHandler,
  controller.update
);

// Dolgozó törlése (Admin)
router.delete("/:dolgozoId", requireRole(ROLES.Admin), controller.remove);

// Dolgozó összes ruhakiadása (saját vagy Manager/Admin)
router.get(
  "/:dolgozoId/ruhak",
  requireSelfOrRole({ paramKey: "dolgozoId", role: ROLES.Manager }),
  controller.listClothes
);

// Dolgozó kint lévő ruhái (saját vagy Manager/Admin)
router.get(
  "/:dolgozoId/ruhak/aktiv",
  requireSelfOrRole({ paramKey: "dolgozoId", role: ROLES.Manager }),
  controller.listActiveClothes
);

// Dolgozók, akiknek van kint ruhája (Manager/Admin)
router.get("/with-active-items", requireRole(ROLES.Manager), controller.listWithActiveItems);

// Új dolgozó felvétele (Admin) – opcionális: külön /api/auth/register is tud user-t létrehozni
router.post("/", requireRole(ROLES.Admin), createDolgozo, validationHandler, controller.create);

module.exports = router;
