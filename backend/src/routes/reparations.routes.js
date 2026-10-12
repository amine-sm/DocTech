const express = require("express");

const router = express.Router();

const reparationsController = require("../controllers/reparations.controller");

/*
  Si votre projet possède déjà auth / authorize,
  décommentez ces deux lignes et adaptez les chemins.
*/

// const auth = require("../middleware/auth");
// const authorize = require("../middleware/authorize");


/* =========================================================
   ROUTES PUBLIQUES
========================================================= */

/*
  Création d'une demande par le client
*/
router.post(
  "/",
  reparationsController.create
);

/*
  Tracking public par numéro de ticket

  IMPORTANT :
  Cette route doit être AVANT /:id
*/
router.get(
  "/tracking/:ticket",
  reparationsController.tracking
);


/*
  Acceptation du devis par le client
*/
router.post(
  "/:id/devis/accept",
  reparationsController.acceptQuote
);


/*
  Refus du devis par le client
*/
router.post(
  "/:id/devis/refuse",
  reparationsController.refuseQuote
);


/* =========================================================
   DASHBOARD ADMIN
========================================================= */

router.get(
  "/dashboard/stats",
  // auth,
  // authorize("reparations.view"),
  reparationsController.dashboardStats
);


/* =========================================================
   LISTE
========================================================= */

router.get(
  "/",
  // auth,
  // authorize("reparations.view"),
  reparationsController.getAll
);


/* =========================================================
   DÉTAIL
========================================================= */

router.get(
  "/:id",
  // auth,
  // authorize("reparations.view"),
  reparationsController.getOne
);


/* =========================================================
   MODIFICATION
========================================================= */

router.put(
  "/:id",
  // auth,
  // authorize("reparations.update"),
  reparationsController.update
);


/* =========================================================
   AFFECTATION TECHNICIEN
========================================================= */

router.put(
  "/:id/technician",
  // auth,
  // authorize("reparations.update"),
  reparationsController.assignTechnician
);


/* =========================================================
   STATUT
========================================================= */

router.put(
  "/:id/status",
  // auth,
  // authorize("reparations.status"),
  reparationsController.updateStatus
);


/* =========================================================
   DIAGNOSTIC
========================================================= */

router.put(
  "/:id/diagnostic",
  // auth,
  // authorize("reparations.update"),
  reparationsController.addDiagnosis
);


/* =========================================================
   DEVIS
========================================================= */

router.post(
  "/:id/devis",
  // auth,
  // authorize("reparations.quote"),
  reparationsController.createQuote
);


/* =========================================================
   SUPPRESSION
========================================================= */

router.delete(
  "/:id",
  // auth,
  // authorize("reparations.delete"),
  reparationsController.remove
);


module.exports = router;