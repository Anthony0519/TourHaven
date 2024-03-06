const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const userAuth = require("../middlewares/authorization");

router.post("/bookings/:roomId", userAuth, bookingController.bookRoom);
router.get("/all-bookings", bookingController.getBookings);
router.get("/one-bookings/:bookingId", bookingController.getBookingById);
router.get("/get-user-bookings", userAuth, bookingController.getUsersBooking);
router.put("/update-bookings/:bookingId", userAuth, bookingController.updateBooking);
router.put("/bookings-checkout/:bookingId", userAuth, bookingController.checkOutPayment);
router.delete(
  "/delete-bookings/:bookingId",
  userAuth,
  bookingController.deleteBooking
);

module.exports = router;