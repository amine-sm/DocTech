const express = require("express");
const router = express.Router();

const { list } = require("../controllers/permissions.controller");

const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

router.get(
  "/",
  auth,
  authorize("permissions.view"),
  asyncHandler(list),
);

module.exports = router;