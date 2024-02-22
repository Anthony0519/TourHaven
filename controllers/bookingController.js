const Booking = require("../models/bookingModel");
const User = require("../models/userModel");

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { userId, date } = req.body;
    const newBooking = await Booking.create({ userId, date });
    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a specific booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a booking by ID
exports.updateBookingById = async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      req.body,
      {
        new: true,
      }
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

// Delete a booking by ID
exports.deleteBookingById = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(
      req.params.bookingId
    );
    if (!deletedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json(deletedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Check-in a user based on booking ID
exports.checkIn = async (req, res) => {
  try {
      const { bookingId } = req.params;

      // Check if the booking exists
      const booking = await Booking.findById(bookingId);
      if (!booking) {
          return res.status(404).json({ error: 'Booking not found' });
      }

      // Check if the booking is already checked in
      if (booking.checkInDetails.isCheckedIn) {
          return res.status(400).json({ error: 'Booking is already checked in' });
      }

      // Update the check-in details
      booking.checkInDetails.isCheckedIn = true;
      booking.checkInDetails.checkInTime = new Date();

      // Save the updated booking
      await booking.save();

      res.status(200).json({ message: 'Check-in successful', booking });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Check-out a user based on booking ID
exports.checkOut = async (req, res) => {
  try {
      const { bookingId } = req.params;

      // Check if the booking exists
      const booking = await Booking.findById(bookingId);
      if (!booking) {
          return res.status(404).json({ error: 'Booking not found' });
      }

      // Check if the booking is already checked out
      if (booking.checkOutDetails.isCheckedOut) {
          return res.status(400).json({ error: 'Booking is already checked out' });
      }

      // Update the check-out details
      booking.checkOutDetails.isCheckedOut = true;
      booking.checkOutDetails.checkOutTime = new Date();

      // Save the updated booking
      await booking.save();

      res.status(200).json({ message: 'Check-out successful', booking });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};