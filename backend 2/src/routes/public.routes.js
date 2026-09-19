const express = require("express");
const publicController = require("../controllers/public.controller");
const commandesController = require("../controllers/commandes.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Catalogue public : catégories
router.get("/categories", asyncHandler(publicController.categories));

// Catalogue public : marques
router.get("/marques", asyncHandler(publicController.marques));

// Catalogue public : liste des articles
router.get("/articles", asyncHandler(publicController.articles));

// Catalogue public : détail d'un article par slug
router.get("/articles/:slug", asyncHandler(publicController.articleBySlug));

// Création d'une commande client sans compte
router.post("/commandes", asyncHandler(commandesController.createPublic));

// Suivi d'une commande par numéro de suivi + téléphone
router.get("/suivi-commande", asyncHandler(commandesController.track));

module.exports = router;
