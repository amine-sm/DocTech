const express = require("express");
const articlesController = require("../controllers/articles.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(auth);

// Liste des articles pour l'administration
router.get(
  "/",
  authorize("articles.view"),
  asyncHandler(articlesController.list),
);

// Détail d'un article
router.get(
  "/:id",
  authorize("articles.view"),
  asyncHandler(articlesController.getOne),
);

// Créer un article
router.post(
  "/",
  authorize("articles.create"),
  asyncHandler(articlesController.create),
);

// Modifier un article
router.put(
  "/:id",
  authorize("articles.update"),
  asyncHandler(articlesController.update),
);

// Supprimer un article
router.delete(
  "/:id",
  authorize("articles.delete"),
  asyncHandler(articlesController.remove),
);

// Ajouter une image à un article
router.post(
  "/:id/images",
  authorize("articles.update"),
  asyncHandler(articlesController.addImage),
);

// Ajouter une variante (couleur, taille, pointure, parfum...)
router.post(
  "/:id/variants",
  authorize("articles.update"),
  asyncHandler(articlesController.addVariant),
);

module.exports = router;
