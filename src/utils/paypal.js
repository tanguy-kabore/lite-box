export const generateAccessToken = async () => {
    try {
        const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_BASE_URL } = process.env;
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error("MISSING_API_CREDENTIALS");
        }

        const fetch = (await import('node-fetch')).default;

        const auth = Buffer.from(
            PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
        ).toString("base64");
        const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Failed to generate Access Token:", error);
        throw new Error("Failed to generate Access Token");
    }
};

export const handleResponse = async (response) => {
    try {
        const jsonResponse = await response.json();
        return {
            jsonResponse,
            httpStatusCode: response.status,
        };
    } catch (err) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
};
