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

    // Extract productId from path parameters
    const id = event.pathParameters && event.pathParameters.id;

    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Path parameter productId is mandatory" }),
        };
    }

    // Parse body to retrieve other fields
    const body = event.body ? JSON.parse(event.body) : {};
    const { productName, productPrice, productStockAmount, productDescription } = body;

    await client.connect();

    try {
        // Retrieve the existing product
        const getProductQuery = `SELECT * FROM product WHERE id = $1`;
        const getProductResult = await client.query(getProductQuery, [id]);

        if (getProductResult.rowCount === 0) {
            await client.end();
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Product not found" }),
            };
        }

        const existingProduct = getProductResult.rows[0];

        // Use provided values if available, otherwise keep the existing ones
        const updatedProductName = productName || existingProduct.name;
        const updatedProductPrice = productPrice !== undefined ? productPrice : existingProduct.price;
        const updatedProductStockAmount = productStockAmount !== undefined ? productStockAmount : existingProduct.stock;
        const updatedProductDescription = productDescription || existingProduct.description;

        const updateQuery = `
            UPDATE product 
            SET name = $1, price = $2, stock = $3, description = $4 
            WHERE id = $5 
            RETURNING id
        `;
        const values = [updatedProductName, updatedProductPrice, updatedProductStockAmount, updatedProductDescription, id];
        const updateResult = await client.query(updateQuery, values);

        await client.end();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Product updated successfully", id: updateResult.rows[0].id }),
        };
    } catch (error) {
        await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error updating product.", error: error.message }),
        };
    }
};
