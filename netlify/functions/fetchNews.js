const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    const query = event.queryStringParameters.q || "India";
    const apiKey = process.env.NEWS_API_KEY;
    console.log("NEWS_API_KEY:", apiKey);
    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "API key not found in environment variables." }),
        };
    }

    const apiUrl = `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify({
                articles: data.articles || [],
            }),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // for CORS
            }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch news" }),
        };
    }
};

