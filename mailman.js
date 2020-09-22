const nodemailer = require('nodemailer')
const config = require('./config')

module.exports = async (emailTo, subject, message, htmlMessage) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.mailAuth.email,
          pass: config.mailAuth.password
        }
    })
      
    let mailOptions = {
        from: `taskMaster <${config.mailAuth.email}>`,
        to: emailTo,
        subject: subject,
        text: message,
        html: htmlMessage
    }
      
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          reject(error)
        } else {
          console.log('Email enviado: ' + info.response);
          resolve('Email enviado: ' + info.response)
        }
      })
    })
}