const express = require("express");

const router = express.Router();

const {
  list,
} = require("../controllers/permissions.controller")

router.get("/", list);

module.exports = router;