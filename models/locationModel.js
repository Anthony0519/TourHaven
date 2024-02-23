const mongoose = require("mongoose")

const hotelLocation = new mongoose.Schema({
    hotel:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"hotels",
    }],
    loc:{
        type:String,
        required:true
    }
},{timestamps:true})

const locModel = mongoose.model("Location",hotelLocation)

module.exports = locModel