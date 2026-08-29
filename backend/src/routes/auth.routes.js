const express = require("express");
const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Connexion administrateur / employé
router.post("/login", asyncHandler(authController.login));

// Déconnexion
router.post("/logout", asyncHandler(authController.logout));

// Retourne l'utilisateur actuellement connecté
router.get("/me", auth, asyncHandler(authController.me));

// Modifier le mot de passe de l'utilisateur connecté
router.patch(
  "/change-password",
  auth,
  asyncHandler(authController.changePassword),
);

module.exports = router;
