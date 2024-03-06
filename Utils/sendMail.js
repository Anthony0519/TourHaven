const nodemailer = require ('nodemailer');
 require('dotenv').config()

const sendEmail = async(options)=>{
    const transporter = nodemailer.createTransport({
    
    host: 'smtp.gmail.com',
    port: 587,
    secure:false,
    service : process.env.service,
    
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