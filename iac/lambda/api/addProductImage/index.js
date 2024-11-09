const { Client } = require('pg');
const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const multipart = require('lambda-multipart-parser');

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

    const result = await multipart.parse(event, true)

    const imageEntry = result.files.find(f => f.fieldname === "image")

    if (!imageEntry) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: 'File not found in request' })
        };
    }

    const bucketName = process.env.IMAGES_BUCKET;

    // Parse the content-type header to determine the file type
    const contentType = imageEntry['contentType']

    // Validate the content type (allow only image types)
    if (!['image/png', 'image/jpeg', 'image/gif'].includes(contentType)) {
        return {
            event,
            statusCode: 400,
            body: JSON.stringify({message: 'Unsupported file type. Only PNG, JPEG, and GIF are allowed.' })
        };
    }

    // Generate a random filename with the appropriate extension based on content-type
    const fileExtension = contentType.split('/')[1];  // Extract the file extension (e.g., 'png', 'jpeg')
    const randomFilename = `item-${id}.${fileExtension}`;

    // S3 parameters
    const s3Params = {
        Bucket: bucketName,
        Key: randomFilename,  // Use the generated random filename
        Body: imageEntry.content,  // Assuming the image content is base64 encoded in the request
        ContentType: contentType,  // Dynamically set the content type
    };

    try {
        // Upload the image to S3
        await S3.putObject(s3Params).promise();

        // Construct the final S3 URL of the uploaded image
        const s3Url = `https://${bucketName}.s3.amazonaws.com/${randomFilename}`;

        await client.connect();

        const query = `UPDATE product SET image_url = $2 WHERE id = $1`;
        const result = await client.query(query, [id, s3Url]);

        if (result.rowCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Product not found" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Image uploaded successfully',
                imageUrl: s3Url
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error uploading image', error: error.message })
        };
    } finally {
        await client.end()
    }

};
