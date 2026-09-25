const express = require("express");
const router = express.Router();

const {
  list,
  getOne,
  create,
  update,
  remove,
} = require("../controllers/roles.controller");

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

router.use(auth);

// Liste des rôles
router.get(
  "/",
  authorize("roles.view"),
  asyncHandler(list),
);

// Détail d'un rôle
router.get(
  "/:id",
  authorize("roles.view"),
  asyncHandler(getOne),
);

// Créer un rôle
router.post(
  "/",
  authorize("roles.create"),
  asyncHandler(create),
);

// Modifier un rôle
router.put(
  "/:id",
  authorize("roles.update"),
  asyncHandler(update),
);

// Supprimer un rôle
router.delete(
  "/:id",
  authorize("roles.delete"),
  asyncHandler(remove),
);

module.exports = router;