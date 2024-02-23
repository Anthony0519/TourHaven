const router = require("express").Router()

const { createhotel, verifyhotel, resendVerification, forgetPassword, signIn, logOut, resetPassword, changeProfieImage, locationSearch, hotelSearch, updateHotel, deleteHotel, getAllHotels } = require("../controllers/hotelController")
const hotelAuth = require("../middlewares/hotelAuth")

const { resetPasswordValidation, updateValidation, forgotValidation, hotelValidation} = require("../middlewares/validation")

router.route("/hotelsignup").post(hotelValidation,createhotel)

router.route("/verifyhotels/:token").get(verifyhotel)

router.route("/hotel-login").post(signIn)

router.route("/hotel-logout").post(hotelAuth,logOut)  

router.route("/hotel-verification").post(resendVerification)

router.route("/hotel-forgetPassword").post(forgotValidation,forgetPassword)

router.route("/hotel-reset_password/:token").post(resetPasswordValidation,resetPassword)

router.route("/hotel-change-profileimage").put(hotelAuth,changeProfieImage)

router.route("/search-location").get(locationSearch)

router.route("/search-hotel").get(hotelSearch)

router.route("/get-all-hotels").get(getAllHotels)

router.route("/updatehotels").put(hotelAuth,updateValidation,updateHotel)

router.route("/deletehotels").delete(hotelAuth,deleteHotel)

module.exports = router