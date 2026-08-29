const express = require("express");
const usersController = require("../controllers/users.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Toutes les routes utilisateurs nécessitent une authentification
router.use(auth);

// Liste des utilisateurs
router.get(
  "/",
  authorize("users.view"),
  asyncHandler(usersController.list),
);

// Détail d'un utilisateur
router.get(
  "/:id",
  authorize("users.view"),
  asyncHandler(usersController.getOne),
);

// Créer un utilisateur
router.post(
  "/",
  authorize("users.create"),
  asyncHandler(usersController.create),
);

// Modifier un utilisateur
router.put(
  "/:id",
  authorize("users.update"),
  asyncHandler(usersController.update),
);

// Supprimer un utilisateur
router.delete(
  "/:id",
  authorize("users.delete"),
  asyncHandler(usersController.remove),
);

module.exports = router;
