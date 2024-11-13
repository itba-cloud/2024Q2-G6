const { Client } = require('pg');
const { jwtDecode } = require('jwt-decode')

const AWS = require('aws-sdk'); 

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

    const userId = event.requestContext?.accountId

    if (userId && event?.headers?.authorization && event?.headers?.authorization !== 'null' && event?.headers?.authorization.split(' ').length > 1) {
        const decoded = jwtDecode(event.headers.authorization.split(' ')[1])
    try {
        const query = `SELECT * FROM users where id = $1`;
        const result = await client.query(query,[userId]);
        const email = decoded.email
        const email_verified = decoded.email_verified
        if (result.rowCount === 0) {
            const insertUserQuery = `INSERT INTO users (id, email, role, verified) VALUES($1,$2,$3,$4)`
            const values = [userId,email, 0, email_verified]
            await client.query(insertUserQuery,values)
        }
        if (decoded["cognito:groups"].includes("product-admins")) {
            const updateUserQuery = `UPDATE users SET role = 1 WHERE id = $1`
            await client.query(updateUserQuery,[userId])
        }
    } catch(error) {
        await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error updating user details", error: error.message }),
        };
    }
    }

    try {
        const query = `SELECT * FROM product`;
        const result = await client.query(query);
        await client.end();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Products retrieved successfully",
                products: result.rows
            }),
        };
    } catch (error) {
        await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error retrieving products.", error: error.message }),
        };
    }
};
