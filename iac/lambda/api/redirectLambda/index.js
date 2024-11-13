exports.handler = async (event) => {
    const queryStringParameters = event.queryStringParameters || {};

    const queryParams = new URLSearchParams(queryStringParameters).toString();

    const baseUrl = process.env.WEBSITE_URL;

    const redirectUrl = queryParams ? `${baseUrl}?${queryParams}` : baseUrl;

    const response = {
        statusCode: 301, // Use 301 for permanent redirect, or 302 for temporary redirect
        headers: {
            Location: redirectUrl,
        },
    };
    return response;
};