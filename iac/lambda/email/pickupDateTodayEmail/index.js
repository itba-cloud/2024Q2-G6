const AWS = require("aws-sdk");
const sgMail = require("@sendgrid/mail");

// Initialize the SendGrid API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
    // Extract the SNS message from the event
    const snsRecord = event.Records[0].Sns;
    const message = JSON.parse(snsRecord.Message);

    // Destructure booking details and recipient information from the message
    const { subject, recipient, bookingDetails } = message;
    const { productName, pickupHour } = bookingDetails;
    if(!subject || !recipient || !bookingDetails){
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid body in sns message" }),
        };
    }
    // Construct email content
    const emailContent = {
        to: recipient,
        from: process.env.SENDGRID_FROM_VERIFIED_EMAIL,  
        subject: subject,
        text: `Hello! The time has finnaly arrived. Your booking of ${productName} is ready today, dont forget to pick it up at: ${pickupHour}`,
        html: `<p>Hello! The time has finnaly arrived.</p>
               <p>Your booking of ${productName} is ready today, dont forget to pick it up at: ${pickupHour}</p>`,
    };

    // Send the email using SendGrid
    try {
        await sgMail.send(emailContent);
        console.log("Email sent successfully to:", recipient);
        return { statusCode: 200, body: JSON.stringify({ message: "Email sent successfully" }) };
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email Send Error");
    }
};
