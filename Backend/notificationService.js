// services/notificationService.js

import nodemailer from "nodemailer"

const transporter=nodemailer.createTransport({

service:"gmail",

auth:{
user:process.env.EMAIL_USER,
pass:process.env.EMAIL_PASS
}

})

export async function sendNotification(email,message){

await transporter.sendMail({

from:process.env.EMAIL_USER,
to:email,
subject:"NNIT Legal Notification",
text:message

})

}