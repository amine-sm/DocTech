const express = require("express");
const permissionsController = require("../controllers/permissions.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Liste de toutes les permissions disponibles
router.get(
  "/",
  auth,
  authorize("permissions.view"),
  asyncHandler(permissionsController.list),
);

module.exports = router;
