const mongoose = require("mongoose")

const hotelLocation = new mongoose.Schema({
    hotel:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"hotel",
    }],
    loc:{
        type:String,
        required:true
    }
})

const locModel = mongoose.model("Location",hotelLocation)

module.exports = locModel