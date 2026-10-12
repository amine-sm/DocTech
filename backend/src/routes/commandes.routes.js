const express = require("express");

const commandesController = require("../controllers/commandes.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

/* =========================================================
   CONTROLLER
========================================================= */

const {
  createPublic,
  list,
  getOne,
  updateStatus,
  track,
  sync,
  listMovements,
  exportExcel,
} = commandesController;


/* =========================================================
   ROUTES SPÉCIFIQUES
   ⚠️ AVANT /:id
========================================================= */

/**
 * GET /commandes/export/excel
 *
 * Export Excel des commandes
 */
router.get(
  "/export/excel",
  auth,
  authorize("commandes.view"),
  exportExcel
);


/**
 * GET /commandes/mouvements
 *
 * Historique des changements de statut
 */
router.get(
  "/mouvements",
  auth,
  authorize("commandes.view"),
  listMovements
);


/* =========================================================
   LISTE DES COMMANDES
========================================================= */

/**
 * GET /commandes
 *
 * Exemples :
 *
 * /commandes
 * /commandes?today=true
 * /commandes?date_from=2026-10-01&date_to=2026-10-02
 * /commandes?status=LIVREE
 * /commandes?limit=100
 * /commandes?page=1&limit=20
 */
router.get(
  "/",
  auth,
  authorize("commandes.view"),
  list
);


/* =========================================================
   CRÉATION PUBLIQUE
========================================================= */

/**
 * POST /commandes
 *
 * Le controller possède :
 *
 * createPublic()
 *
 * et non :
 *
 * create()
 *
 * Cette route est volontairement sans auth,
 * car createPublic est destinée à la création
 * depuis le site e-commerce.
 */
router.post(
  "/",
  createPublic
);


/* =========================================================
   TRACKING
========================================================= */

/**
 * GET /commandes/:id/track
 *
 * IMPORTANT :
 * Cette route doit être AVANT /:id
 */
router.get(
  "/:id/track",
  auth,
  authorize("commandes.view"),
  track
);


/* =========================================================
   SYNCHRONISATION ELOGISTIA
========================================================= */

/**
 * POST /commandes/:id/sync-delivery
 */
router.post(
  "/:id/sync-delivery",
  auth,
  authorize("commandes.update"),
  sync
);


/* =========================================================
   MODIFICATION DU STATUT
========================================================= */

/**
 * PATCH /commandes/:id/status
 *
 * Body :
 *
 * {
 *   "status": "CONFIRMEE"
 * }
 */
router.patch(
  "/:id/status",
  auth,
  authorize("commandes.update"),
  updateStatus
);


/* =========================================================
   DÉTAIL COMMANDE
========================================================= */

/**
 * GET /commandes/:id
 *
 * Retourne :
 * - commande
 * - articles
 * - images
 * - historique
 */
router.get(
  "/:id",
  auth,
  authorize("commandes.view"),
  getOne
);


/* =========================================================
   EXPORT
========================================================= */

module.exports = router;