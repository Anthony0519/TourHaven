const nodemailer = require ('nodemailer');
 require('dotenv').config()

const sendEmail = async(options)=>{
    const transporter = nodemailer.createTransport({
    
    host: 'smtp.gmail.com',
    service : "gmail" ,
    port: 587,
    secure:false,

    auth:{
        user : process.env.user,
        pass : process.env.mailPass,        
    },
    })
    let mailOption = { 
        from : `"Tour Haven" ${process.env.user}`,
        to: options.email,
        subject:options.subject,
        html: options.html
    }
    await transporter.sendMail(mailOption)
    // console.log('Message sent')
}

module.exports = sendEmail