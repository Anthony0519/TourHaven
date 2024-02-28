const Booking = require("../models/bookingModel");

const bookRoom = async (req, res) => {
  try {
    const { room, guestName, checkInDate, checkOutDate, totalAmount } =
      req.body;
    const newBooking = await Booking.create({
      room,
      guestName,
      checkInDate,
      checkOutDate,
      totalAmount,
    });
    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const notifyRoomsAsVacant = async () => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const overdueBookings = await Booking.find({
      checkInDate: { $lt: twentyFourHoursAgo },
      status: "occupied",
    });

    for (const booking of overdueBookings) {
      booking.status = "vacant";
      await booking.save();
    }

    console.log("Rooms notified as vacant for overdue bookings");
  } catch (error) {
    console.error(error);
  }
};

const runBackgroundTask = () => {
  // Schedule the task to run every 24 hours
  setInterval(notifyRoomsAsVacant, 24 * 60 * 60 * 1000);
};

const triggerBackgroundTask = async (req, res) => {
  try {
    await notifyRoomsAsVacant();
    res.status(200).json({ message: "Background task triggered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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
  runBackgroundTask,
  triggerBackgroundTask,
};
