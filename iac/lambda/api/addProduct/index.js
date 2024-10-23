const { Client } = require('pg');

exports.handler = async (event) => {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
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
