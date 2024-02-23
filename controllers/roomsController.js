const roomModel = require("../models/roomModel")
const hotelModel = require("../models/hotelModel")
const cloud = require("../config/cloudConfig")

exports.uploadRoom = async(req,res)=>{
    try{

        // get the hotel's id from the auth
        const ID = req.user.hotelId

        // get the rooms details
        const {roomType,price} = req.body

        // find the hotel
        const hotel = await hotelModel.findById(ID)
        if (!hotel) {
            return res.status(400).json({
                error:"error uploading room"
            })
        }

        // upload the room image
        const file = req.files.roomImage.tempFilePath
        const image = await cloud.uploader.upload(file)

        const createRoom = roomModel({
            hotel:hotel._id,
            roomType,
            price,
            roomImage:image.secure_url
        })
        await createRoom.save()

        // push the room id to the hotel
        hotel.hotelRooms.push(createRoom._id)
        await hotel.save()

        res.status(200).json({
            message:"room uploaded successfully"
        })

    }catch(err){
        res.status(500).json({
            error:err.message
        })
    }
}

exports.updateRoom = async (req, res) => {
    try {
        // Get the hotel's ID from the authenticated user
        const ID = req.user.hotelId;

        // get the room id
        const {roomID} = req.params
        // Get the room details to update
        const {roomType, price } = req.body;

        // Find the hotel
        const hotel = await hotelModel.findById(ID);
        if (!hotel) {
            return res.status(400).json({
                error: "Hotel not found"
            });
        }

        // Find the room to update
        const room = await roomModel.findById(roomID);
        if (!room) {
            return res.status(400).json({
                error: "Room not found"
            });
        }

        if (req.file) {
            const oldImage = hotel.roomImage.split("/").pop().split(".")[0]
            await cloud.uploader.destroy(oldImage)

        }

        // update the new image
        const file = req.files.roomImage.tempFilePath
        const newImage = await cloud.uploader.upload(file)

        // Update the room details
        room.roomImage = newImage
        room.roomType = roomType;
        room.price = price;

        // Save the updated room
        await room.save();

        res.status(200).json({
            message: "Room updated successfully",
            room: room
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        // Get the hotel's ID from the authenticated user
        const hotelID = req.user.hotelId;

        // Get the room ID to delete
        const { roomID } = req.params;

        // Find the hotel
        const hotel = await hotelModel.findById(hotelID);
        if (!hotel) {
            return res.status(400).json({
                error: "Hotel not found"
            });
        }

        // Find the room to delete
        const room = await roomModel.findById(roomID);
        if (!room) {
            return res.status(400).json({
                error: "Room not found"
            });
        }

        // Delete the room image from Cloudinary (if it exists)
        if (room.roomImage) {
            const oldImage = hotel.roomImage.split("/").pop().split(".")[0];
            await cloudinary.uploader.destro(oldImage);
        }

        // Delete the room from the database
        await roomModel.findByIdAndDelete(roomID)

        // Remove the room ID from the hotel's rooms array
        hotel.hotelRooms = hotel.hotelRooms.filter(id => id.toString() !== roomID);
        await hotel.save();

        res.status(200).json({
            message: "Room deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};