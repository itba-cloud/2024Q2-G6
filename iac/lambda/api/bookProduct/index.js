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

    const { id } = event.pathParameters;

    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Product ID is required" }),
        };
    }

    if (!event.body){
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Request should have a body with fields productName, productPrice y productStockAmount are mandatory" }),
        };
    }
    const body = JSON.parse(event.body);

    const userId = event.requestContext.accountId

    await client.connect();

    try {
        const query = `SELECT * FROM users where id = $1`;
        const result = await client.query(query,[userId]);
        const decoded = jwtDecode(event.headers.authorization.split(' ')[1])
        const email = decoded.email
        const email_verified = decoded.email_verified
        if (result.rowCount === 0) {
            const insertUserQuery = `INSERT INTO users (id, email, role, verified) VALUES($1,$2,$3,$4)`
            const values = [userId,email, 0, email_verified]
            await client.query(insertUserQuery,values)
        }
    } catch(error) {
        await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error adding new user", error: error.message }),
        };
    }

    const { amount } = body;

    if (!userId || !amount){
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Fields productName, productPrice y productStockAmount are mandatory" }),
        };
    }

    if ( amount <= 0 ){
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid body values" }),
        };
    }

    try {
        const query = `SELECT stock FROM product where id = $1`;
        const result = await client.query(query,[id]);
        if (result.rowCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Product not found" }),
            };
        }
        stock = result.rows[0].stock;
        if (stock < amount){
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Amount to book is greater than stock" }),
            };
        }
    } catch(error) {
        await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error booking product", error: error.message }),
        };
    }
    try {
        const query = `UPDATE product SET stock = stock - $2 WHERE id = $1`;
        const result = await client.query(query, [id, amount]);
        if (result.rowCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Product not found" }),
            };
        }
    } catch(error) {
        await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error booking product", error: error.message }),
        };
    }

    try{
        const query = `INSERT INTO reservation (user_id,product_id,quantity) VALUES($1,$2,$3)`
        const values = [userId,id,amount]
        await client.query(query,values);
        await client.end();
    }catch(error){
        await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error booking product.", error: error.message }),
        };
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Succesfull booking of product" }),
    };
};
