const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Statistiques principales du dashboard administrateur
router.get(
  "/summary",
  auth,
  authorize("dashboard.view"),
  asyncHandler(dashboardController.summary),
);

module.exports = router;
