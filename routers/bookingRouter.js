const express = require("express");
const router = express.Router();
const {
  completeCheckout,
  getBookingDetails,
  checkIn,
} = require("../controllers/bookingController");

// Checkout routes
router.post("/checkin/complete", checkIn);
router.post("/checkout/complete", completeCheckout);
router.get("/checkout/:bookingId", getBookingDetails);

module.exports = router;
