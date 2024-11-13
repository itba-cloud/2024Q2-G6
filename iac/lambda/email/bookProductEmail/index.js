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
    const { userId, productId, quantity, pickupDate, pickupHour } = bookingDetails;

    // Construct email content
    const emailContent = {
        to: recipient,
        from: process.env.SENDGRID_FROM_VERIFIED_EMAIL,  
        subject: subject,
        text: `Hello! Your booking has been confirmed. Booking details:
               - Product ID: ${productId}
               - Quantity: ${quantity}
               - Pickup Date: ${pickupDate}
               - Pickup Hour: ${pickupHour}`,
        html: `<p>Hello! Your booking has been confirmed.</p>
               <p>Booking details:</p>
               <ul>
                   <li><strong>Product ID:</strong> ${productId}</li>
                   <li><strong>Quantity:</strong> ${quantity}</li>
                   <li><strong>Pickup Date:</strong> ${pickupDate}</li>
                   <li><strong>Pickup Hour:</strong> ${pickupHour}</li>
               </ul>`,
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
