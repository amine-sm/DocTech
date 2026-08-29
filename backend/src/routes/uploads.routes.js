const express = require("express");
const uploadsController = require("../controllers/uploads.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/upload");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Upload d'une image depuis l'administration
router.post(
  "/image",
  auth,
  authorize("uploads.create"),
  upload.single("image"),
  asyncHandler(uploadsController.uploadImage),
);

module.exports = router;
