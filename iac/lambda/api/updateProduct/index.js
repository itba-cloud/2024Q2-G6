const { Client } = require('pg');

exports.handler = async (event) => {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
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
