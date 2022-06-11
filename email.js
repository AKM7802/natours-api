const nodemailer=require('nodemailer'); //npm i nodemailer

//MAIL TRAP IS A SERVICE TO TEST SENDING EMAILS TO USERS WHICH WONT GO TO theM BUT GETS TRAPPED IN THE MAILTRAP ITS DeTAILS IS GIVEN IN THE CONFIG FILE WHICH CAN BE USED TO CONNECT TO THE MAILTRAP USING Transporter


const sendEmail=async options=>{
    // 1) Create a transporter - Transporter is used to send mail from a service
    // const transporter=nodemailer.createTransport({
    //     service:"Gmail",
    //     auth:{
    //         user:process.env.EMAIL_USERNAME,
    //         pass:process.env.EMAIL_PASSWORD
    //     }
    //     //Activate in gmail "less secure option" option
    // })

    //Using mailtrap to trap mails 
    const transporter=nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })

    // 2)Define the email options
    const mailOptions={
        from:'Aswanth Krishna <aswanth@ak.io>',
        to:options.email,
        subject:options.subject,
        text:options.message
        //html
    }

    // 3) Actually send the email
    await transporter.sendMail(mailOptions)

}

module.exports=sendEmail;