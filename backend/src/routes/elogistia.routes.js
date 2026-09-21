const express = require("express");

const router = express.Router();

const elogistiaController = require("../controllers/elogistia.controller");

// ========================================
// WILAYAS
// GET /api/elogistia/wilayas
// ========================================
router.get(
  "/wilayas",
  elogistiaController.getWilayas
);

// ========================================
// COMMUNES
// GET /api/elogistia/municipalities?wilaya=31
// ========================================
router.get(
  "/municipalities",
  elogistiaController.getMunicipalities
);

// ========================================
// AGENCES
// GET /api/elogistia/agences
// ========================================
router.get(
  "/agences",
  elogistiaController.getAgences
);

// ========================================
// FRAIS DE LIVRAISON
// GET /api/elogistia/shipping-costs
// ========================================
router.get(
  "/shipping-costs",
  elogistiaController.getShippingCost
);

// ========================================
// COMMANDES
// GET /api/elogistia/orders
// ========================================
router.get(
  "/orders",
  elogistiaController.getOrders
);

// ========================================
// COMMANDE PAR TRACKING
// GET /api/elogistia/orders/:tracking
// ========================================
router.get(
  "/orders/:tracking",
  elogistiaController.getOrderByTracking
);

// ========================================
// AJOUTER COMMANDE
// POST /api/elogistia/orders
// ========================================
router.post(
  "/orders",
  elogistiaController.insertCommande
);

// ========================================
// TRACKING
// GET /api/elogistia/tracking/:tracking
// ========================================
router.get(
  "/tracking/:tracking",
  elogistiaController.getTracking
);

// ========================================
// MANY TRACKING
// GET /api/elogistia/tracking?tracking=XXX
// ========================================
router.get(
  "/tracking",
  elogistiaController.getManyTracking
);

// ========================================
// MODIFIER STATUT
// PATCH /api/elogistia/orders/:tracking/status
// ========================================
router.patch(
  "/orders/:tracking/status",
  elogistiaController.updateOrderStatus
);

// ========================================
// SUPPRIMER COMMANDE
// DELETE /api/elogistia/orders/:tracking
// ========================================
router.delete(
  "/orders/:tracking",
  elogistiaController.deleteOrder
);

// ========================================
// BORDEREAU 10x10
// GET /api/elogistia/print/10x10/:tracking
// ========================================
router.get(
  "/print/10x10/:tracking",
  elogistiaController.printBordereau10x10
);

// ========================================
// BORDEREAU 10x15
// GET /api/elogistia/print/10x15/:tracking
// ========================================
router.get(
  "/print/10x15/:tracking",
  elogistiaController.printBordereau10x15
);

// ========================================
// BORDEREAU 15x20
// GET /api/elogistia/print/15x20/:tracking
// ========================================
router.get(
  "/print/15x20/:tracking",
  elogistiaController.printBordereau15x20
);

// ========================================
// BORDEREAU MULTIPLE
// GET /api/elogistia/print/multiple?tracking=XXX
// ========================================
router.get(
  "/print/multiple",
  elogistiaController.printBordereauMultiple
);

module.exports = router;