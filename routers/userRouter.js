const router = require("express").Router()
const { createUser, signIn, verifyUser, updateUser, forgetPassword, logOut, resendVerification, resetPassword, deleteUser } = require("../controllers/userController")
const authorization = require("../middlewares/authorization")
const { signUpValidation, resetPasswordValidation, updateValidation, forgotValidation } = require("../middlewares/validation")

router.route("/signup").post(signUpValidation,createUser)

router.route("/login").post(signIn)

router.route("/logout").post(authorization,logOut)

router.route("/verify/:token").get(verifyUser)

router.route("/verification").get(resendVerification)

router.route("/forgetPassword").post(forgotValidation,forgetPassword)

router.route("/reset_password/:token").post(resetPasswordValidation,resetPassword)

router.route("/updateusers").put(authorization,updateValidation,updateUser)

router.route("/deleteusers").delete(authorization,deleteUser)

module.exports = router
