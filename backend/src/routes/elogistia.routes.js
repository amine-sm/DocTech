const express = require("express");

const router =
  express.Router();

const controller =
  require("../controllers/elogistia.controller");

/* =========================================================
   WILAYAS
========================================================= */

router.get(
  "/wilayas",
  controller.getWilayas
);

/* =========================================================
   COMMUNES
========================================================= */

router.get(
  "/municipalities",
  controller.getMunicipalities
);

/* =========================================================
   AGENCES
========================================================= */

router.get(
  "/agences",
  controller.getAgences
);

/* =========================================================
   SHIPPING COST
========================================================= */

router.get(
  "/shipping-costs",
  controller.getShippingCost
);

/* =========================================================
   ORDERS
========================================================= */

router.get(
  "/orders",
  controller.getOrders
);

/* =========================================================
   ORDER TRACKING
========================================================= */

router.get(
  "/orders/:tracking",
  controller.getOrderByTracking
);

/* =========================================================
   TRACKING
========================================================= */

router.get(
  "/tracking/:tracking",
  controller.getTracking
);

/* =========================================================
   DELETE ORDER
========================================================= */

router.delete(
  "/orders/:tracking",
  controller.deleteOrder
);

/* =========================================================
   INSERT COMMANDE
========================================================= */

router.post(
  "/orders",
  controller.insertCommande
);

module.exports = router;