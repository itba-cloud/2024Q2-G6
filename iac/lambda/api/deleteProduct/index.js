const { Client } = require('pg');

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
