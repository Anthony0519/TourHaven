const router = require("express").Router()

const { uploadRoom, updateRoom, deleteRoom, } = require("../controllers/roomsController")
const hotelAuth = require("../middlewares/hotelAuth")

router.route("/add-rooms").post(hotelAuth,uploadRoom)

router.route("/update-rooms").post(hotelAuth,updateRoom)

router.route("/delete-rooms").post(hotelAuth,deleteRoom)

module.exports = router