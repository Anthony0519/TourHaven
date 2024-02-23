const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  paymentDetails: {
    // Add payment details fields as needed
  },
  status: {
    type: String,
    default: "Pending", // Initial status, customize as needed
  },
  checkInDetails: {
    isCheckedIn: {
      type: Boolean,
      default: false,
    },
    checkInTime: Date,
    // Other check-in related fields
  },
  checkOutDetails: {
    isCheckedOut: {
      type: Boolean,
      default: false,
    },
    checkOutTime: Date,
    // Other check-out related fields
  },
  // Other booking-related fields

  // Timestamps for tracking creation and modification times
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
