const mongoose = require("mongoose")

const hotelSchema = new mongoose.Schema({
    hotelName:{
        type:Strings,
        required:true,
    },
    email:{
        type:Strings,
        required:true,
        unique:true
    },
    phoneNumber:{
        type:Number,
        required:true,
    },
    hotelImage:{
        type:Strings,
    },
    city:{
        type:Strings,
        required:true
    },
    address:{
        type:Strings,
        required:true
    },
    Password:{
        type:Strings,
        required:true,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    hotelBlacklist:{
        default:[]
    },
})

const hotelModel = mongoose.model("hotels",hotelSchema)

module.exports = hotelModel