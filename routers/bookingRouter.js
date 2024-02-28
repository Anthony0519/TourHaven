const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const userAuth = require("../middlewares/authorization");

router.post("/bookings", userAuth, bookingController.bookRoom);
router.get("/bookings", bookingController.getBookings);
router.get("/bookings/:bookingId", bookingController.getBookingById);
router.put("/bookings/:bookingId", userAuth, bookingController.updateBooking);
router.delete(
  "/bookings/:bookingId",
  userAuth,
  bookingController.deleteBooking
);
router.post(
  "/trigger-background-task",
  bookingController.triggerBackgroundTask
);
module.exports = router;
