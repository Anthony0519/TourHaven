const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const createdDate = DateTime.toLocaleString({weekday: "short",month: "short",day: "2-digit",year: "numeric"});
const createdTime = DateTime.toLocaleString({hour:"2-digit",minute:"2-digit",second:"2-digit"});

// Define Mongoose schema
const bookingSchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      required: true,
    },
    NoOfGuest: {
      type: Number,
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rooms",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    perNight: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    bookedDate: {
      type: String,
      default: createdDate 
    },
    bookedTime: {
      type: String,
      default: createdTime
    }
  },
  { timestamps: true }
);

const bookingModel = mongoose.model("booking", bookingSchema);

module.exports = bookingModel;
