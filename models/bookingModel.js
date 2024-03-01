const mongoose = require("mongoose");
const {DateTime} = require("luxon")

const date = DateTime.now().toLocaleString({weekday:"short",month:"short",day:"2-digit", year:"numeric"})

const time = DateTime.now().toLocaleString({hour:"2-digit",minute:"2-digit",second:"2-digit"})

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
      type:mongoose.Schema.Types.ObjectId,
      ref:"rooms",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"users",
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    bookedDate:{
      type:Date,
      default:date
    },
    bookedTime:{
      type:Date,
      default:time
    },
    isBooked:{
      type:Boolean,
      default:false
    },

  },
  { timestamps: true }
);

const bookingModel = mongoose.model("booking", bookingSchema);

module.exports = bookingModel;