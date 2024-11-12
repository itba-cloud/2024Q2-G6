const { Client } = require('pg');
const AWS = require('aws-sdk'); 
const sns = new AWS.SNS({
    httpOptions: {
      timeout: 3000, // Timeout in milliseconds (3 seconds)
    },
  });
const snsTopicArn = process.env.PICKUP_DATE_TODAY_TOPIC;

class SecretsManager {
    
    /**
     * Uses AWS Secrets Manager to retrieve a secret
     */
    static async getSecret (secretName, region){
        const config = { region : region }
        var secret, decodedBinarySecret;
        let secretsManager = new AWS.SecretsManager(config);
        console.log("Asking for secret")
        try {
            let secretValue = await secretsManager.getSecretValue({SecretId: secretName}).promise();
            if ('SecretString' in secretValue) {
                return secret = secretValue.SecretString;
            } else {
                let buff = new Buffer(secretValue.SecretBinary, 'base64');
                return decodedBinarySecret = buff.toString('ascii');
            }
        } catch (err) {
            if (err.code === 'DecryptionFailureException')
                // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'InternalServiceErrorException')
                // An error occurred on the server side.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'InvalidParameterException')
                // You provided an invalid value for a parameter.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'InvalidRequestException')
                // You provided a parameter value that is not valid for the current state of the resource.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'ResourceNotFoundException')
                // We can't find the resource that you asked for.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
        }
    }
    
     
    
}


exports.handler = async (event) => {
    var secretName = process.env.SECRET_NAME;
    var region = process.env.REGION;
    var secreto = await SecretsManager.getSecret(secretName, region);
    console.log(secreto);
    var db_password = JSON.parse(secreto)
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: db_password.password,
        database: process.env.DB_NAME,
    });

    await client.connect();
    var rows;
    try{
        const query = `SELECT product.name as name,reservation.pickup_hour as pickup_hour,users.email as user_email FROM product JOIN reservation ON reservation.product_id=product.id JOIN users ON reservation.user_id=users.id WHERE reservation.reservation_date::date = CURRENT_DATE;  `
        const result = await client.query(query);
        await client.end();
        rows = result.rows
    }catch(error){
        await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error gettint daily reservations.", error: error.message }),
        };
    }


    


    

    for(const row of rows){
        // Construct the SNS message payload with structured booking details
        const snsMessage = JSON.stringify({
            subject: "Today is your pick up date!",
            recipient: row.user_email,
            bookingDetails: {
                productName: row.name,
                pickupHour: row.pickup_hour,
            },
        });

        // Set up SNS publish parameters
        const params = {
            Message: snsMessage,
            TopicArn: snsTopicArn,
            Subject: "Today is your pick up date!",
        };

        // Publish message to SNS and handle success or error
        await sns.publish(params).promise()
            .then((data) => {
                console.log(`Message sent to SNS topic ${snsTopicArn}`);
                console.log("MessageID:", data.MessageId);
            })
            .catch((err) => {
                console.error("Error sending message to SNS:", err);
                throw new Error("SNS Publish Error");
            });

    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Succesfully notified all reservations for today" }),
    };
};
