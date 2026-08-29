const express = require("express");
const commandesController = require("../controllers/commandes.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Liste des commandes
router.get(
  "/",
  auth,
  authorize("commandes.view"),
  asyncHandler(commandesController.list),
);

// Détail d'une commande
router.get(
  "/:id",
  auth,
  authorize("commandes.view"),
  asyncHandler(commandesController.getOne),
);

// Modifier le statut d'une commande
router.patch(
  "/:id/status",
  auth,
  authorize("commandes.update"),
  asyncHandler(commandesController.updateStatus),
);

module.exports = router;
