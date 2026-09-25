const express = require("express");
const marquesController = require("../controllers/marques.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(auth);

/* =========================================================
   LISTE — accessible depuis :
   - /admin/marques     → marques.view
   - /admin/articles    → articles.view (select marque)
========================================================= */
router.get(
  "/",
  authorize("marques.view", "articles.view"),
  asyncHandler(marquesController.list),
);

// Détail d'une marque
router.get(
  "/:id",
  authorize("marques.view"),
  asyncHandler(marquesController.getOne),
);

// Créer une marque
router.post(
  "/",
  authorize("marques.create"),
  asyncHandler(marquesController.create),
);

// Modifier une marque
router.put(
  "/:id",
  authorize("marques.update"),
  asyncHandler(marquesController.update),
);

// Supprimer une marque
router.delete(
  "/:id",
  authorize("marques.delete"),
  asyncHandler(marquesController.remove),
);

module.exports = router;