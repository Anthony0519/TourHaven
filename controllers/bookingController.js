const Booking = require("../models/bookingModel");
const userModel = require("../models/userModel")
const roomModel = require("../models/roomModel")
const {DateTime} = require("luxon")

const bookRoom = async (req, res) => {
  try {
    // get the user's id and room id
    const ID = req.user.userId
    const {roomId} = req.params
    const { NoOfGuest, guestName, checkIn, checkOut, checkInTime, checkOutTime } = req.body;

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
// checks if the room is vacant
// if(room.isBooked === true) {
//   return res.status(400).json({
//     error:"This room has already been booked!"
//   })
// }

    // Parse the date and time to Luxon
    const checkInDateTime = DateTime.fromFormat(checkIn + ' ' + checkInTime, 'yyyy-MM-dd HH:mm', { zone: 'Africa/Lagos' });
    const checkOutDateTime = DateTime.fromFormat(checkOut + ' ' + checkOutTime, 'yyyy-MM-dd HH:mm', { zone: 'Africa/Lagos' })

    // Get the current date and time in Lagos timezone
    const currentDateTime = DateTime.now().setZone('Africa/Lagos').startOf('day')

 // Check if the dates are valid
 if (!checkInDateTime.isValid || !checkOutDateTime.isValid ) {
     return res.status(400).json({
         error: 'Invalid check-in or check-out date format',
     });
 }

  
  // Check if the dates are valid
  if (checkInDateTime >= checkOutDateTime) {
       return res.status(400).json({
       error: 'Invalid date range. Check-out date should be after or equal to check-in date',
      });
  }
  
  if (checkInDateTime < currentDateTime) {
       return res.status(400).json({
       error: 'Invalid date range. Check-in date should not be in the past!',
      });
  }

  // function to check if the new booking overLaps an already existing booking
  const checkOverLap = async (roomId, checkInDateTime, checkOutDateTime) => {
    try {

      
      // find the room from the booking
      const existingBooking = await Booking.find({
        room:roomId,
        $or:[{
          $and:[
            { checkIn:{$lt:checkOutDateTime.toISO()}},
            {checkOut:{$gt:checkInDateTime.toISO()}},
            {paymentStatus:{$eq:"paid"}}
          ]
        }]

      })
      // console.log(existingBooking)
      
      return existingBooking.length > 0
      
    } catch (error) {
      res.status(500).json({
        error:`error checking for overlap booking: ${error.message}`
      })
    }
  }

  // get the overLaping if there is one
  const existingBooking = await checkOverLap(roomId, checkInDateTime, checkOutDateTime)
  if(existingBooking){
    return res.status(400).json({
      error:"This room has already been booked!"
    })
  }
  // console.log(existingBooking)


  // calculate the total price based on the total days of stay
  const pricePerNight = room.price

  const calculatePrice = (checkInDateTime,checkOutDateTime,pricePerNight) => {

    // caculate duration 
    const duration = checkOutDateTime.diff(checkInDateTime, "milliseconds")
    // convert to days
    const NumOfDays = Math.ceil(duration.as("days"))
    // round up price
    const total = NumOfDays * pricePerNight

    // return calculation as an object 
    return {
      totalDays:NumOfDays,
      totalPrice:total
    }

  }

  const totalAmount = calculatePrice(checkInDateTime,checkOutDateTime,pricePerNight)

  // save the booking in the dataBase
  const newBooking = await Booking.create({
      guestName,
      NoOfGuest,
      checkIn:checkInDateTime,
      checkOut:checkOutDateTime,
      perNight:pricePerNight,
      checkInTime,
      checkOutTime,
      totalDay:totalAmount.totalDays,
      totalAmount:totalAmount.totalPrice,
      room:room._id,
      user:user._id
    });

    // // save the booking
    // room.isBooked = true
    // await room.save()

    res.status(201).json({
      message:"booking successfull",
      data:newBooking
    });
  } catch (error) {
    res.status(500).json({ 
      error:error.message
    });
}
}


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
    if(bookings.length === 0){
      return res.status(404).json({
        error:"No booking made yet"
      })
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
  try {
    // get the booking id
    const { bookingId } = req.params;

    // find the room
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({
        error:"room not found"
      })
    }

    // get the room associated with the booking
    const roomId = booking.room
    const room = await roomModel.findById(roomId)

    // get the details for te updates
    const { NoOfGuest, guestName, checkIn, checkOut, checkInTime, checkOutTime } = req.body;

    const checkInDateTime = DateTime.fromFormat(checkIn + ' ' + checkInTime, 'yyyy-MM-dd HH:mm', { zone: 'Africa/Lagos' });
    const checkOutDateTime = DateTime.fromFormat(checkOut + ' ' + checkOutTime, 'yyyy-MM-dd HH:mm', { zone: 'Africa/Lagos' })

    // Get the current date and time in Lagos timezone
    const currentDateTime = DateTime.now().setZone('Africa/Lagos').startOf('day')

 // Check if the dates are valid
 if (!checkInDateTime.isValid || !checkOutDateTime.isValid ) {
     return res.status(400).json({
         error: 'Invalid check-in or check-out date format',
     });
 }

  
  // Check if the dates are valid
  if (checkInDateTime >= checkOutDateTime) {
       return res.status(400).json({
       error: 'Invalid date range. Check-out date should be after or equal to check-in date',
      });
  }
  
  if (checkInDateTime < currentDateTime) {
       return res.status(400).json({
       error: 'Invalid date range. Check-in date should not be in the past!',
      });
  }

  // function to check if the new booking overLaps an already existing booking
  const checkOverLap = async (roomId, checkInDateTime, checkOutDateTime) => {
    try {

      // find the room from the booking
       const existingBooking = await Booking.find({
        room:roomId,
        $or:[{
          $and:[
            { checkIn:{$lt:checkOutDateTime.toISO()}},
            {checkOut:{$gt:checkInDateTime.toISO()}},
            {paymentStatus:{$eq:"paid"}}
          ]
        }]

      })

      
      return existingBooking.length > 0
      
    } catch (error) {
      res.status(500).json({
        error:`error checking for overlap booking: ${error.message}`
      })
    }
  }

  // get the overLaping if there is one
  const existingBooking = await checkOverLap(roomId, checkInDateTime, checkOutDateTime)
  if(existingBooking){
    return res.status(400).json({
      error:"This room has already been booked!"
    })
  }


  // calculate the total price based on the total days of stay
  const pricePerNight = room.price

  const calculatePrice = (checkInDateTime,checkOutDateTime,pricePerNight) => {

    // caculate duration 
    const duration = checkOutDateTime.diff(checkInDateTime, "milliseconds")
    // convert to days
    const NumOfDays = Math.ceil(duration.as("days"))
    // round up price
    const total = NumOfDays * pricePerNight

    // return calculation as an object 
    return {
      totalDays:NumOfDays,
      totalPrice:total
    }

  }

  const totalAmount = calculatePrice(checkInDateTime,checkOutDateTime,pricePerNight)

  const updateOnly = {
    NoOfGuest:NoOfGuest || booking.NoOfGuest,
    guestName:guestName || booking.guestName,
    checkIn:checkInDateTime || booking.checkInDateTime,
    checkOut:checkOutDateTime || booking.checkOutDateTime,
    perNight:pricePerNight || booking.perNight,
    totalAmount:totalAmount.totalPrice || booking.totalPrice,
    totalDay:totalAmount.totalDays || booking.totalDay
    // checkInTime,
    // checkOutTime
  }


    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateOnly,
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

const checkOutPayment = async(req,res)=>{
  try {

    // get the booking id
    const {bookingId} = req.params
    // find the booking
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({
        error:"room not found"
      })
    }

    const roomId = booking.room
    // console.log(roomId)

    const checkInDateTime = booking.checkIn
    const checkOutDateTime = booking.checkOut
      // function to check if the new booking overLaps an already existing booking
  const checkOverLap = async (roomId, checkInDateTime, checkOutDateTime) => {
    try {

      // find the room from the booking
       const existingBooking = await Booking.find({
        room:roomId,
        $or:[{
          $and:[
            { checkIn:{$lt:checkOutDateTime}},
            {checkOut:{$gt:checkInDateTime}},
            {paymentStatus:{$eq:"paid"}}
          ]
        }]

      })

      
      return existingBooking.length > 0
      
    } catch (error) {
      res.status(500).json({
        error:`error checking for overlap booking: ${error.message}`
      })
    }
  }

  // get the overLaping if there is one
  const existingBooking = await checkOverLap(roomId, checkInDateTime, checkOutDateTime)
  if(existingBooking){
    return res.status(400).json({
      error:"room already booked by another client"
    })
  }

    // if (booking.paymentStatus === "true") {
    //   return res.status(400).json({
    //     error:"room already booked by another client"
    //   })
    // }

    booking.paymentStatus = "paid"
    await booking.save()

    res.status(200).json({
      message:"payment successfull",
      data:booking
    })
    
  } catch (error) {
    res.status(500).json({
      error:error.message
    })
  }
}

module.exports = {
  bookRoom,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  checkOutPayment,
  // runBackgroundTask,
  // triggerBackgroundTask,
};