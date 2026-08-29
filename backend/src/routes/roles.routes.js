const express = require("express");
const rolesController = require("../controllers/roles.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(auth);

// Liste des rôles
router.get("/", authorize("roles.view"), asyncHandler(rolesController.list));

// Détail d'un rôle et de ses permissions
router.get(
  "/:id",
  authorize("roles.view"),
  asyncHandler(rolesController.getOne),
);

// Créer un rôle
router.post(
  "/",
  authorize("roles.create"),
  asyncHandler(rolesController.create),
);

// Modifier un rôle et ses permissions
router.put(
  "/:id",
  authorize("roles.update"),
  asyncHandler(rolesController.update),
);

// Supprimer un rôle
router.delete(
  "/:id",
  authorize("roles.delete"),
  asyncHandler(rolesController.remove),
);

module.exports = router;
