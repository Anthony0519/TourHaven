const mongoose = require("mongoose")
const { DateTime } = require("luxon")

const createdOn = DateTime.now()
const createdDate = createdOn.toLocaleString({weekday: "short",month: "short",day: "2-digit",year: "numeric"});
const createdTime = createdOn.toLocaleString({hour:"2-digit",minute:"2-digit",second:"2-digit"});

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
    checkInTime: {
      type: Date,
      required: true,
    },
    checkOutTime : {
      type: Date,
      required: true,
    },
    perNight: {
      type: Number,
    },
    totalDay: {
      type: Number,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      Enum:["pending","Paid"],
      default:"pending",
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
