const express = require("express");
const categoriesController = require("../controllers/categories.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(auth);

// Liste des catégories
router.get(
  "/",
  authorize("categories.view"),
  asyncHandler(categoriesController.list),
);

// Détail d'une catégorie
router.get(
  "/:id",
  authorize("categories.view"),
  asyncHandler(categoriesController.getOne),
);

// Créer une catégorie
router.post(
  "/",
  authorize("categories.create"),
  asyncHandler(categoriesController.create),
);

// Modifier une catégorie
router.put(
  "/:id",
  authorize("categories.update"),
  asyncHandler(categoriesController.update),
);

// Supprimer une catégorie
router.delete(
  "/:id",
  authorize("categories.delete"),
  asyncHandler(categoriesController.remove),
);

module.exports = router;
