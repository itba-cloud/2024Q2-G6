const { Client } = require('pg');
const AWS = require('aws-sdk'); 
const jwt = require('jsonwebtoken');

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
    const secretName = process.env.SECRET_NAME;
    const region = process.env.REGION;
    const secreto = await SecretsManager.getSecret(secretName, region);
    console.log(secreto);
    const db_password = JSON.parse(secreto);

    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: db_password.password,
        database: process.env.DB_NAME,
    });

    const token = event.headers.Authorization || event.headers.authorization;
    if (!token) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "Unauthorized" }),
        };
    }

    const decodedToken = jwt.decode(token.replace('Bearer ', ''));

    let isAdmin = false;
    if (decodedToken && decodedToken.scope && decodedToken.scope.includes('product-admins')) {
        isAdmin = true;
    }

    const bookingId = event.pathParameters.id;
    await client.connect();

    try {
        let query;
        let result;

        if (isAdmin) {
            // Admin can delete any booking
            query = `DELETE FROM reservation WHERE id = $1 RETURNING *`;
            result = await client.query(query, [bookingId]);
        } else {
            // Regular user can delete only their own bookings
            const userId = event.requestContext.accountId;
            query = `DELETE FROM reservation WHERE id = $1 AND user_id = $2 RETURNING *`;
            result = await client.query(query, [bookingId, userId]);
        }

        await client.end();

        if (result.rowCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Booking not found or not authorized to delete." }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Booking deleted successfully",
                deletedBooking: result.rows[0]
            }),
        };
    } catch (error) {
        await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error deleting booking.", error: error.message }),
        };
    }
};