const router = require("express").Router()

const { uploadRoom, updateRoom, deleteRoom, } = require("../controllers/roomsController")
const hotelAuth = require("../middlewares/hotelAuth")

router.route("/add-rooms").post(hotelAuth,uploadRoom)

router.route("/update-rooms/:roomID").put(hotelAuth,updateRoom)

router.route("/delete-rooms/:roomID").delete(hotelAuth,deleteRoom)

module.exports = router