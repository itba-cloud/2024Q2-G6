const { Client } = require('pg');

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

    const { id } = event.pathParameters;

    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Product ID is required" }),
        };
    }

    await client.connect();

    try {
        const query = `DELETE FROM product WHERE id = $1`;
        const values = [id];
        const res = await client.query(query, values);
        
        if (res.rowCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Product not found" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Product deleted successfully" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error deleting product.", error: error.message }),
        };
    } finally {
        await client.end();
    }
};
