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

    if (!event.body){
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Request should have a body with fields productName, productPrice y productStockAmount are mandatory" }),
        };
    }
    const body = JSON.parse(event.body);

    const { productName, productPrice, productStockAmount, productDescription} = body;

    if (!productName || !productPrice || !productStockAmount || !productDescription ){
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Fields productName, productPrice y productStockAmount are mandatory" }),
        };
    }
    if ( productName == "" || productPrice <= 0 || productStockAmount <= 0 ){
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid body values" }),
        };
    }
    
    await client.connect();

    try{
        const query = `INSERT INTO product (name,price,stock,description, image_url) VALUES($1,$2,$3,$4,$5) RETURNING id`
        const values = [productName,productPrice,productStockAmount,productDescription, "https://pbs.twimg.com/profile_images/1475829463766249473/rltJ5_u3_400x400.jpg"]
        const result = await client.query(query,values);
        await client.end();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Succesfull product adding", id: result.rows[0].id }),
        };
    }catch(error){
        await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error adding product.", error: error.message }),
        };
    }
};
