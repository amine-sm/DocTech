const express = require("express");
const controller = require("../controllers/delivery.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// Public Elogistia data used by checkout.
router.get("/wilayas", asyncHandler(controller.wilayas));
router.get("/municipalities", asyncHandler(controller.municipalities));
router.get("/agences", asyncHandler(controller.agencies));
router.get("/shipping-costs", asyncHandler(controller.shippingCosts));
router.get("/tracking", asyncHandler(controller.tracking));

// Admin operations.
router.use(auth, authorize("commandes.view"));
router.get("/orders", asyncHandler(controller.orders));
router.get("/orders/:tracking", asyncHandler(controller.order));
router.get("/orders/:tracking/history", asyncHandler(controller.manyTracking));
router.get("/orders/:tracking/bordereau", asyncHandler(controller.bordereau));
router.patch("/orders/:tracking/status", authorize("commandes.update"), asyncHandler(controller.updateStatus));
router.delete("/orders/:tracking", authorize("commandes.update"), asyncHandler(controller.remove));
router.post("/sync/:id", authorize("commandes.update"), asyncHandler(controller.syncOrder));

module.exports = router;
