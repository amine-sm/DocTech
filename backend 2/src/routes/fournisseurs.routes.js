const express = require("express");
const fournisseursController = require("../controllers/fournisseurs.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(auth);

// Liste des fournisseurs
router.get(
  "/",
  authorize("fournisseurs.view"),
  asyncHandler(fournisseursController.list),
);

// Détail d'un fournisseur
router.get(
  "/:id",
  authorize("fournisseurs.view"),
  asyncHandler(fournisseursController.getOne),
);

// Créer un fournisseur
router.post(
  "/",
  authorize("fournisseurs.create"),
  asyncHandler(fournisseursController.create),
);

// Modifier un fournisseur
router.put(
  "/:id",
  authorize("fournisseurs.update"),
  asyncHandler(fournisseursController.update),
);

// Supprimer un fournisseur
router.delete(
  "/:id",
  authorize("fournisseurs.delete"),
  asyncHandler(fournisseursController.remove),
);

module.exports = router;
