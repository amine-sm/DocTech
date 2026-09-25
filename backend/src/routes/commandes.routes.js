const express = require("express");
const commandesController = require("../controllers/commandes.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

/* =========================================================
   ⚠️ ROUTES SPÉCIFIQUES EN PREMIER (avant /:id)
========================================================= */

// ✅ Historique des mouvements de statut
// GET /commandes/mouvements?today=true
// GET /commandes/mouvements?date_from=2026-09-01&date_to=2026-09-30
// GET /commandes/mouvements?status=LIVREE&order_id=5
router.get(
  "/mouvements",
  auth,
  authorize("commandes.view"),
  asyncHandler(commandesController.listMovements)
);

// Liste des commandes (avec filtres: today, date_from, date_to, status)
router.get(
  "/",
  auth,
  authorize("commandes.view"),
  asyncHandler(commandesController.list)
);

/* =========================================================
   ROUTES PAR :id
========================================================= */

// Détail d'une commande
router.get(
  "/:id",
  auth,
  authorize("commandes.view"),
  asyncHandler(commandesController.getOne)
);

// Sync Elogistia manuelle
router.post(
  "/:id/sync-delivery",
  auth,
  authorize("commandes.update"),
  asyncHandler(commandesController.sync)
);

// Modifier le statut d'une commande (avec historique + stock)
router.patch(
  "/:id/status",
  auth,
  authorize("commandes.update"),
  asyncHandler(commandesController.updateStatus)
);

module.exports = router;