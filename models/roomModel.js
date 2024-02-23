const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema({
    hotel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"hotels",
    },
    roomImage:{
        type:String,
    },
    roomType:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true
    },

})

const roomModel = mongoose.model("room",roomSchema)

module.exports = roomModel