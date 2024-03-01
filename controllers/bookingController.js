const Booking = require("../models/bookingModel");
const userModel = require("../models/userModel")
const roomModel = require("../models/roomModel")

const bookRoom = async (req, res) => {
  try {
    // get the user's id and room id
    const ID = req.user.userId
    const {roomId} = req.params
    const { NoOfGuest, guestName, checkInDate, checkOutDate } = req.body;

    // find the user
    const user = await userModel.findById(ID)
    if (!user) {
      return res.status(404).json({
          error:"user not found"
      })
  }
// find the room
  const room = await roomModel.findById(roomId)
  if (!room) {
    return res.status(404).json({
        error:"room not found"
    })
}



    const newBooking = await Booking.create({
      guestName,
      NoOfGuest,
      checkInDate,
      checkOutDate,
    });
    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const notifyRoomsAsVacant = async () => {
//   try {
//     const twentyFourHoursAgo = new Date();
//     twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

//     const overdueBookings = await Booking.find({
//       checkInDate: { $lt: twentyFourHoursAgo },
//       status: "occupied",
//     });

//     for (const booking of overdueBookings) {
//       booking.status = "vacant";
//       await booking.save();
//     }

//     console.log("Rooms notified as vacant for overdue bookings");
//   } catch (error) {
//     console.error(error);
//   }
// };

// const runBackgroundTask = () => {
//   // Schedule the task to run every 24 hours
//   setInterval(notifyRoomsAsVacant, 24 * 60 * 60 * 1000);
// };

// const triggerBackgroundTask = async (req, res) => {
//   try {
//     await notifyRoomsAsVacant();
//     res.status(200).json({ message: "Background task triggered successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

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