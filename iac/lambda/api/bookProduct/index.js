const { Client } = require('pg');
const { jwtDecode } = require('jwt-decode')

exports.handler = async (event) => {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
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