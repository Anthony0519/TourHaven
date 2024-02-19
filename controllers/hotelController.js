const hotelModel = require("../models/hotelModel")
const locModel = require("../models/locationModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendMail = require("../Utils/sendMail")
const dynamicMail = require("../Utils/emailtemplate")


// create a new hotel
exports.createhotel = async (req,res)=>{
    try{

        // get the hotel's input
        const {hotelName,email,phoneNumber,city,address,password,confirmPassword} = req.body
        
        // check if the email already exist
        const checkEmail = await hotelModel.findOne({email:email})
        if(checkEmail){
            return res.status(400).json({
                error:"email already in use"
            })
        }
        // check if the password matches
        if(confirmPassword !== password){
            return res.status(400).json({
                error:"password does not match"
            })
        }

        // hash the password
        const saltPass = bcrypt.genSaltSync(12)
        const hash = bcrypt.hashSync(password,saltPass)

        // create the hotel
        const hotel = await hotelModel.create({
            hotelName:hotelName.toLowerCase().charAt(0).toUpperCase() + hotelName.slice(1),
            email:email.toLowerCase(),
            phoneNumber,
            address,
            city,
            hotelImage,
            password:hash
        })

        // check if the hotel city exist
        let location = await locModel.findOne({loc:city})
        if(!location){
            // create a new one if it does not exist
            location = await locModel.create({
                loc:city
            })
        }

        // then push the hotel's id to the existing loc or the new one
        location.hotel.push(hotel._id)

        // generate a token for the hotel
        const token = jwt.sign({
            hotelId:hotel._id,
            email:hotel.email,
            tel:hotel.phoneNumber
        },process.env.jwtKey,{expiresIn:"5mins"})

        // verify the hotels email
        const link = `${req.protocol}://${req.get("host")}/resetPassword/${token}`
        const html = dynamicMail(link,hotel.hotelName,hotel.lastName.slice(0,1).toUpperCase())

        sendMail({
            email:hotel.email,
            subject: "KIND VERIFY YOUR ACCOUNT",
            html:html
        })

        // success message
        res.status(201).json({
            message:"Account created successfully... Kindly check your email for verification",
            hotel
        })

    }catch(err){
        res.status(500).json({
            error:err.message
        })
    }
}

exports.verifyhotel = async (req,res)=>{
    try{

        // get the hotel token
        const {token} = req.params
        if (!token) {
            return res.status(400).json({
                error:"link expired"
            })
        }

        // extract the hotel's id from the token
        const decodeToken = jwt.verify(token,process.env.jwtKey)

        // extract the hotel's id
        const ID = decodeToken.hotelId

        // find the hotel that own the token
        const hotel = await hotelModel.findById(ID)
        if(!hotel){
            return res.status(400).json({
                error:"email not found"
            })
        }

        // check if the hotel is already verified
        if(hotel.isverified === true){
            return res.status(400).json({
                error:"hotel already verified"
            })
        }
        
        // find by id and verify
         const verify = await hotelModel.findByIdAndUpdate(ID,{isVerified:true}, {new:true})
    
        res.status(200).json({
            message: "you have been verified",
            verify
        })

    }catch(err){
        res.status(500).json({
            error:err.message
        })
    }
}