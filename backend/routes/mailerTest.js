import express from 'express'
import nodemailer from 'nodemailer'
const router = express.Router()
router.get('/',(req,res)=>{

    async function main() {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
        //   host: "smtp.gmail.com",
        //   port: 587,
        //   secure: false, // true for 465, false for other ports
          service: 'gmail',
          auth: {
            user: 'pshouvickd97@gmail.com', // generated ethereal user
            pass: 'Shou@1997', // generated ethereal password
          },
        });
      
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"🛒 supakart" <pshouvickd97@gmail.com>', // sender address
          to: `shouvickp@gmail.com`, // list of receivers
          subject: "Order Confirmed", // Subject line
          html: `<b>Hi Your order Hasbeen Confirmed</b>`, // html body
        });
      
        if(info.messageId){
          console.log("Message sent: %s", info.messageId);
          res.send('email sent')
        }
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        else{
          console.log("Message Jaini:");
          res.send('email jaini')
        }
      }
      
      main().catch(console.error);
})
export default router