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

    const overwrite = event?.body?.overwrite

    await client.connect();

    const query = `
        DO $$
        BEGIN
            DROP TABLE IF EXISTS product CASCADE;
            DROP TABLE IF EXISTS reservation CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            CREATE TABLE product(
                id serial PRIMARY KEY,
                name varchar(256) NOT NULL,
                price numeric(10,2)  NOT NULL,
                stock int  NOT NULL CHECK (stock > 0),
                description varchar(1000)  NOT NULL,
                image_url varchar(256)
            );
            
             CREATE TABLE users(
                id varchar(256) PRIMARY KEY,
                username varchar(256) UNIQUE,
                role int  NOT NULL, 
                email varchar(256)  UNIQUE NOT NULL,
                verified boolean  NOT NULL
            );

            CREATE TABLE reservation(
                id serial PRIMARY KEY,
                user_id varchar(256)  NOT NULL,
                product_id int  NOT NULL,
                quantity int NOT NULL,
                reservation_date timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
                status varchar(256)  NOT NULL DEFAULT 'PENDING',
                foreign key (user_id) references users(id),
                foreign key (product_id) references product(id)
            );

            -- Insert a user into the 'users' table
            INSERT INTO users (id, username, role, email, verified)
            VALUES (1, 'john_doe', 1, 'john.doe@example.com', true)
            ON CONFLICT (username) DO NOTHING;

            -- Insert two products into the 'product' table
            INSERT INTO product (name, price, stock, description, image_url)
            VALUES 
                ('Product 1', 29.99, 100, 'Description for Product 1', 'https://img.freepik.com/free-photo/organic-cosmetic-product-with-dreamy-aesthetic-fresh-background_23-2151382816.jpg?semt=ais_hybrid'),
                ('Product 2', 49.99, 50, 'Description for Product 2', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D');
        END $$;
    `;

    await client.query(query);
    await client.end();

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Migration executed successfully" }),
    };
};
