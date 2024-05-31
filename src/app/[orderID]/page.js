/* import { generateAccessToken, handleResponse } from '../../utils/paypal';

const captureOrder = async (orderID) => {
    const accessToken = await generateAccessToken();
    const fetch = (await import('node-fetch')).default;
    const url = `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return handleResponse(response);
};

export default async (req, res) => {
    if (req.method === 'POST') {
        try {
            const { orderID } = req.query;
            const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
            res.status(httpStatusCode).json(jsonResponse);
        } catch (error) {
            console.error("Failed to capture order:", error);
            res.status(500).json({ error: "Failed to capture order." });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
 */