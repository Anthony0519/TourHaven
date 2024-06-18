const Booking = require("../models/bookingModel");
const userModel = require("../models/userModel");
const roomModel = require("../models/roomModel");
const { DateTime } = require("luxon");

const bookRoom = async (req, res) => {
  try {
    // get the user's id and room id
    const ID = req.user.userId;
    const { roomId } = req.params;
    const { NoOfGuest, guestName, checkIn, checkOut } = req.body;

    // find the user
    const user = await userModel.findById(ID);
    if (!user) {
      return res.status(404).json({
        error: "user not found",
      });
    }
    // find the room
    const room = await roomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({
        error: "room not found",
      });
    }
    // checks if the room is vacant
    if (room.isBooked === true) {
      return res.status(400).json({
        error: "This room has already been booked!",
      });
    }

    // Parse the date and time to luxon
    const checkInDate = DateTime.fromFormat(checkIn, "yyyy-MM-dd", {
      zone: "Africa/Lagos",
    });
    const checkOutDate = DateTime.fromFormat(checkOut, "yyyy-MM-dd", {
      zone: "Africa/Lagos",
    });

    // Check if the dates are valid
    if (!checkInDate.isValid || !checkOutDate.isValid) {
      return res.status(400).json({
        message: "Invalid check-in or check-out date format",
      });
    }

    // Get the current date in Lagos timezone
    const currentDate = DateTime.now().setZone("Africa/Lagos").startOf("day");

    // Check if the dates are valid
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        message:
          "Invalid date range. Check-out date should be after or equal to check-in date",
      });
    }

    if (checkInDate < currentDate) {
      return res.status(400).json({
        message: "Invalid date range. Check-in date should not be in the past!",
      });
    }

    // calculate the total price based on the total days of stay
    const pricePerNight = room.price;

    const calculatePrice = (checkInDate, checkOutDate, pricePerNight) => {
      // caculate duration
      const duration = checkOutDate.diff(checkInDate, "milliseconds");
      // convert to days
      const NumOfDays = Math.ceil(duration.as("days"));
      // round up price
      const total = NumOfDays * pricePerNight;

      // return calculation as an object
      return {
        totalDays: NumOfDays,
        totalPrice: total,
      };
    };

    const totalAmount = calculatePrice(
      checkInDate,
      checkOutDate,
      pricePerNight
    );

    // save the booking in the dataBase
    const newBooking = await Booking.create({
      guestName,
      NoOfGuest,
      checkIn,
      checkOut,
      perNight: pricePerNight,
      totalAmount: totalAmount.totalPrice,
      room: room._id,
      user: user._id,
    });

    // save the booking
    room.isBooked = true;
    await room.save();

    res.status(201).json({
      message: "booking successfull",
      data: newBooking,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    if (bookings.length === 0) {
      return res.status(404).json({
        error: "No booking made yet",
      });
    }
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getBookingById = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateBooking = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      req.body,
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteBooking = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);
    if (!deletedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  bookRoom,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  // runBackgroundTask,
  // triggerBackgroundTask,
};
