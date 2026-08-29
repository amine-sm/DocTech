const express = require("express");
const promotionsController = require("../controllers/promotions.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(auth);

// Liste des promotions
router.get(
  "/",
  authorize("promotions.view"),
  asyncHandler(promotionsController.list),
);

// Détail d'une promotion
router.get(
  "/:id",
  authorize("promotions.view"),
  asyncHandler(promotionsController.getOne),
);

// Créer une promotion
router.post(
  "/",
  authorize("promotions.create"),
  asyncHandler(promotionsController.create),
);

// Modifier une promotion
router.put(
  "/:id",
  authorize("promotions.update"),
  asyncHandler(promotionsController.update),
);

// Supprimer une promotion
router.delete(
  "/:id",
  authorize("promotions.delete"),
  asyncHandler(promotionsController.remove),
);

module.exports = router;
