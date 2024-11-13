const AWS = require("aws-sdk");
const sgMail = require("@sendgrid/mail");

// Initialize the SendGrid API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
    // Extract the SNS message from the event
    const snsRecord = event.Records[0].Sns;
    const message = JSON.parse(snsRecord.Message);

    // Destructure booking details and recipient information from the message
    const { subject, recipient, productDetails } = message;
    const {  productId } = productDetails;

    // Construct email content
    const emailContent = {
        to: recipient,
        from: process.env.SENDGRID_FROM_VERIFIED_EMAIL,  
        subject: subject,
        text: `The porduct with id: ${productId} has ran out of stock`,
        html: `<p>Hello! The porduct with id: ${productId} has ran out of stock</p>`,
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
