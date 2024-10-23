const { Client } = require('pg');

exports.handler = async (event) => {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    await client.connect();

    try {
        const query = `SELECT * FROM reservation`;
        const result = await client.query(query);
        await client.end();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Bookings retrieved successfully",
                products: result.rows
            }),
        };
    } catch (error) {
        await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error retrieving bookings.", error: error.message }),
        };
    }
};