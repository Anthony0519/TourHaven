const hotelModel = require("../models/hotelModel")
const locModel = require("../models/locationModel")
const roomModel = require("../models/roomModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendMail = require("../Utils/sendMail")
const {hotelMail, resetPasswordMail} = require("../Utils/emailtemplate")
const cloud = require("../config/cloudConfig")


// create a new hotel
exports.createhotel = async (req,res)=>{
    try{

        // get the hotel's input
        const {hotelName,email,phoneNumber,city,address,password,confirmPassword,desc,stars,features} = req.body

        // check if tne hotel entered all fields
        if(!hotelName || !email || !phoneNumber || !city || !address || !password || !confirmPassword){
            return res.status(400).json({
                error:"All fields must be filled"
            })
        }
        
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


        const newFeatures = features.split(",")

        // console.log(req.files)
        // console.log(req.file.hotelImages)

        // upload image
        const file = req.files.profileImage.tempFilePath

        const profiles = await cloud.uploader.upload(file)

        // create the hotel
        const hotel = await hotelModel.create({
            hotelName:hotelName.toLowerCase().charAt(0).toUpperCase() + hotelName.slice(1),
            email:email.toLowerCase(),
            phoneNumber,
            address,
            city:city.toLowerCase().charAt(0).toUpperCase() + city .slice(1),
            desc,
            stars,
            features:newFeatures,
            profileImage:profiles.secure_url,
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

        // then push the hotel's id to the existing loc or the new one and save
        location.hotel.push(hotel._id)
        await location.save()

        // generate a token for the hotel
        const token = jwt.sign({
            hotelId:hotel._id,
            email:hotel.email,
            tel:hotel.phoneNumber
        },process.env.jwtKey,{expiresIn:"5mins"})

        // verify the hotels email
        const link = `${req.protocol}://${req.get("host")}/verifyhotels/${token}`
        const html = hotelMail(link,hotel.hotelName)

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

exports.AddRoomImages = async(req,res)=>{
    try{

        const ID = req.user.hotelId

        const hotel = await hotelModel.findById(ID)
        if(!hotel) {
            return res.status(404).json({
                error:"hotel not found"
            })
        }

              // Array to store the secure URLs of uploaded images
              const uploadedImages = [];

              // console.log(req.files.hotelImages )
              if (req.files && req.files.hotelImages) {
                  // Loop through each file in req.files.hotelImages
              for (const image of req.files.hotelImages) {
                  // Upload the current image to Cloudinary
                   const rooms = await cloud.uploader.upload(image.tempFilePath);
                   // Push the secure URL of the uploaded image to the array
                   uploadedImages.push(rooms.secure_url);
                   }
              }

              hotel.hotelImages = uploadedImages
              await hotel.save()

              res.status(200).json({
                message:"file uploaded",
                data:hotel
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

exports.resendVerification = async (req,res)=>{
    try{

        // get the hotel's email
        const {email} = req.body
        if (!email) {
            return res.status(404).json({
              error: "Please enter your email address"
            });
          }
      

        // find the hotel with the email
        const hotel = await hotelModel.findOne({email:email.toLowerCase()})
        if(!hotel){
            return res.status(404).json({
                error:"email not found"
            })
        }

       // check if the hotel is already verified
        if(hotel.isVerified === true){
            return res.status(400).json({
                error:"hotel already verified"
            })
        }        

        // generate a token for the hotel
        const token = jwt.sign({
            hotelId:hotel._id,
            email:hotel.email,
            tel:hotel.phoneNumber
        },process.env.jwtKey,{expiresIn: "5mins"})

        // verify the hotels email
        const link = `${req.protocol}://${req.get("host")}/api/v1/users/verifyhotels/${token}`
        const html = dynamicMail(link,hotel.hotelName)

        sendMail({
            email:hotel.email,
            subject: "KIND VERIFY YOUR ACCOUNT",
            html:html
        })

        res.status(200).json({
            message: "verification mail sent to your email"
        })


    }catch(err){
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({
                error:"link expired"
            })
        }
        res.status(500).json({
            error:err.message
        })
    }
}

exports.signIn = async (req,res)=>{
    try{

        // get the hotel's input
        const {email,password } = req.body;

        // check if tne hotel entered all fields
        if(!email || !password){
            return res.status(400).json({
                error:"All fields must be filled"
            })
        }

        // check if tghe hotel exist
        const hotel = await hotelModel.findOne({email:email.toLowerCase()})
        if(!hotel){
            return res.status(400).json({
                error: "wrong email"
            })
        }

        // check for pasword
        const checkPassword = bcrypt.compareSync(password,hotel.password)
        if (!checkPassword) {
            return res.status(400).json({
                error: "wrong password"
            })
        }

        // check for verification
        // if(hotel.isVerified  === false){
        //     return res.status(400).json({
        //         error: "kindly verify your email so you can login"
        //     })
        // }

        // generate a token for the hotel if all detail are correct
        const token = jwt.sign({
            hotelId:hotel._id,
            email:hotel.email,
            tel:hotel.phoneNumber
        },process.env.jwtKey,{expiresIn:"1d"})

        // throw a success respomse
        res.status(200).json({
            message:"Login successful",
            data:hotel,
            token:token
        })

    }catch(err){
        res.status(500).json({
            error:err.message
        })
    }
}

exports.forgetPassword = async (req,res)=>{
    try {

        // request for the hotel's email
        const {email} = req.body
        if (!email) {
            return res.status(404).json({
              error: "Please enter your email address"
            });
          }

        // check if the hotels email exist in the dataBase
        const hotel = await hotelModel.findOne({email:email.toLowerCase()})
        if (!hotel) {
            return res.status(404).json({
                error:"hotel not found"
            })
        }

        // if hotel found generate a new token for the hotel
        const token = jwt.sign({hotelId:hotel._id},process.env.jwtKey,{expiresIn:"10mins"})

        const link = `${req.protocol}://${req.get("host")}/reset_password/${token}`
        const html =  resetPasswordMail(link, hotel.firstName)

        sendMail({
            email: hotel.email,
            subject:"VERIFY YOUR EMAIL TO RESET PASSWORD",
            html:html
        })

        // throw a success message
        res.status(200).json({
            message:"Email sent successfully"
        })
        
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({
                error:"link expired"
            })
        }
        res.status(500).json({
            error:err.message
        })
    }
}

exports.resetPassword = async (req,res)=>{
    try {

        // get the token from the params
        const {token} = req.params
        if (!token) {
            return res.status(404).json({
                error:"token not found"
            })
        }

        // get the hotel's input
        const {newPassword,confirmPassword} = req.body

        // check if the fields are empty
        if (confirmPassword !== newPassword) {
            return res.status(400).json({
                error:"password does not match"
            })
        }

        // encrypt the token
        const decodeToken = jwt.verify(token,process.env.jwtKey)

        // extract the hotel's id        
        const ID = decodeToken.hotelId

        // find the hotel with the token
        const hotel = await hotelModel.findById(ID)
        if (!hotel) {
            return res.status(404).json({
                error:"hotel not found"
            })
        }

        // bcrypt the password
        const saltPass = bcrypt.genSaltSync(12)
        const hash = bcrypt.hashSync(newPassword,saltPass)

        // save the changes
        hotel.password = hash
        await hotel.save()

        // return success message
        res.status(200).json({
            message: "password reset successfully"
        })
        
    } catch (err) {
        res.status(500).json({
            error:err.message
        })
    }
}

exports.updateHotel = async(req,res)=>{
    try {

        // get the hotel's id
        const ID = req.user.hotelId

        // get the hotel's input
        const {hotelName,phoneNumber,email,city,address} = req.body

        // find tyhe hotel with the id
        const hotel = await hotelModel.findById(ID)
        if (!hotel) {
            return res.status(404).json({
                error:"hotel not found"
            })
        }

        // create an instance of what the hotel can edit
        const editOnly = {
            hotelName,
            email,
            phoneNumber,
            city,
            address
        }

        // eddit the details
        const updated = await hotelModel.findByIdAndUpdate(ID,editOnly,{new:true})
        if (!updated) {
            return res.status(400).json({
                error:"error updating hotel"
            })
        }

        // success message
        res.status(200).json({
            message:"hotel updatted successfully"
        })
        
    } catch (err) {
        res.status(500).json({
            error:err.message
        })
    }
}

exports.changeProfileImage = async(req,res)=>{
    try {

        // get the id from the token
        const ID = req.user.hotelId

        // get the hotel with the id
        const hotel = await hotelModel.findById(ID)
        if (!hotel) {
            return res.status(404).json({
                error:"user not found"
            })
        }

        // detroy the prvious image/and update the new one
        if (hotel.profileImage) {
            const oldImage = hotel.profileImage.split("/").pop().split(".")[0]
            await cloud.uploader.destroy(oldImage)

        }

        // update the new image
        const file = req.files.profileImage.tempFilePath
        const newImage = await cloud.uploader.upload(file)
        await hotelModel.findByIdAndUpdate(ID,{profileImage:newImage.secure_url},{new:true})

        res.status(200).json({
            message: "picture updated"
        })

    } catch (err) {
        res.status(500).json({
            error:err.message
        })
    }
}

// return all hotels for landing page
exports.getAllHotels = async(req,res)=>{
    try{

        const hotel = await hotelModel.find().populate("hotelRooms")
        if(hotel.length === 0){
            return res.status(404).json({
                error:"No registered hotel yet"
            })
        }

        // extract hotel inputs
        const extractedHotel = hotel.map(hotels => ({
            hotelId:hotels._id,
            name:hotels.hotelName,
            description:hotels.desc,
            profileImage:hotels.profileImage,
            city:hotels.city,
            address:hotels.address,
            features:hotels.features,
            stars:hotels.stars,
            hotelImages:hotels.hotelImages,
            availableRooms:hotels.hotelRooms.map(rooms => ({
                roomId:rooms._id,
                Type:rooms.roomType,
                image:rooms.roomImage,
                price:rooms.price,
                Number:rooms.roomNum
            }))
        }))

        res.status(200).json({
            data:extractedHotel
        })

    } catch (err) {
        res.status(500).json({
            error:err.message
        })
    }
}

// location or hotel search or hotel search
exports.Search = async(req,res)=>{
    try {

        // get the user's search
        const {search} = req.params
        if(!search){
            return res.status(400).json({
                error:"can't search an empty field"
            })
        }

        const convertedSearch = search.toLowerCase().charAt(0).toUpperCase() + search.slice(1)

        // check if the search is a location
        const loc = await locModel.findOne({loc:search}).populate({path:"hotel", populate:{path:"hotelRooms"}})
        if (!loc) {

            // if not location search in hotel
            const hotel = await hotelModel.find().where("hotelName").equals(`${convertedSearch}`).populate("hotelRooms")
            if(hotel.length === 0){
                return res.status(404).json({
                    error:`No result found for ${search}`
                })
            }

            // extract hotel inputs
            const extractedHotel = hotel.map(hotels => ({
                hotelId:hotels._id,
                name:hotels.hotelName,
                description:hotels.desc,
                profileImage:hotels.profileImage,
                city:hotels.city,
                address:hotels.address,
                features:hotels.features,
                stars:hotels.stars,
                hotelImages:hotels.hotelImages,
                availableRooms:hotels.hotelRooms.map(rooms => ({
                    roomId:rooms._id,
                    Type:rooms.roomType,
                    image:rooms.roomImage,
                    price:rooms.price,
                    Number:rooms.roomNum
                }))
            }))

            // retun the hotels
           return res.status(200).json({
                message:`${hotel.length} hotel found for ${search}`,
                data:extractedHotel
            })

        }

        // extract details from the locstion returned
        const extractedData = loc.hotel.map(hotel => ({
            hotelId:hotel._id,
            name: hotel.hotelName,
            description: hotel.desc,
            profileImage: hotel.profileImage,
            city: hotel.city,
            address: hotel.address,
            features: hotel.features,
            stars: hotel.stars,
            hotelImages: hotel.hotelImages,
            availableRooms: hotel.hotelRooms.map(room => ({
                roomId:room._id,
                Type: room.roomType,
                image: room.roomImage,
                price: room.price,
                Number: room.roomNum
            }))
        }));

        res.status(200).json({
            message:`${loc.hotel.length} Hotels in ${search},Lagos`,
            data:extractedData
        })
        
    } catch (err) {
        res.status(500).json({
            error:err.message
        })
    }
}

exports.hotelSearch = async(req,res)=>{
    try {

        // get the user's location
       const {hotel} = req.params

       const convertedSearch = hotel.toLowerCase().charAt(0).toUpperCase() + hotel.slice(1)

    //    find the location
    const loc = await hotelModel.find().where("hotelName").equals(`${convertedSearch}`).populate("hotelRooms")
    if(!loc){
        return res.status(404).json({
            error:"hotel not found"
        })
    }

               // extract hotel inputs
               const extractedHotel = loc.map(hotels => ({
                hotelId:hotel._id,
                name:hotels.hotelName,
                description:hotels.desc,
                profileImage:hotels.profileImage,
                city:hotels.city,
                address:hotels.address,
                features:hotels.features,
                stars:hotels.stars,
                hotelImages:hotels.hotelImages,
                availableRooms:hotels.hotelRooms.map(rooms => ({
                    roomId:rooms._id,
                    Type:rooms.roomType,
                    image:rooms.roomImage,
                    price:rooms.price,
                    Number:rooms.roomNum
                }))
            }))

            // retun the hotels
            res.status(200).json({
                message:`${loc.length} hotel found for ${hotel}`,
                data:extractedHotel
            })
        
    } catch (err) {
        res.status(500).json({
            error:err.message
        })
    }
}

exports.deleteHotel = async(req,res)=>{
    try {

        // get the hotel's id
        const ID = req.user.hotelId

        // find tyhe hotel with the id
        const hotel = await hotelModel.findById(ID)
        if (!hotel) {
            return res.status(404).json({
                error:"hotel not found"
            })
        }

         // delete hotel rooms
        const room = await roomModel.findOne({hotel:ID})
       if(room){
         
        if(room.roomImage){
            const oldImage = room.roomImage.split("/").pop().split(".")[0]
            await cloud.uploader.destroy(oldImage)
        }

        await roomModel.deleteMany({hotel:ID})

       }

        if (hotel.profileImage) {
            const oldImage = hotel.profileImage.split("/").pop().split(".")[0]
            await cloud.uploader.destroy(oldImage)
        }

        // delete hotels
        await hotelModel.findByIdAndDelete(ID)


        res.status(200).json({
            message:"Account deleted successfully"
        })
        
    } catch (err) {
        res.status(500).json({
            error:err.message
        })
    }
}

exports.logOut = async (req, res) => {
    try {

        // get the hotel's id from token
        const hotelId = req.user.hotelId;

        // find the hotel
        const hotel = await hotelModel.findById(hotelId)
        if (!hotel) {
            return res.status(404).json({
                message: 'This hotel does not exist',
            });
        }

        // get thehotels token and push to blacklist
        const token = req.headers.authorization.split(' ')[1];
        hotel.blackList.push(token)
        // save the hotel
        await hotel.save()

        // return sucess message
        res.status(200).json({
            message: 'logged out successfull',
            hotel
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        })
    }
}