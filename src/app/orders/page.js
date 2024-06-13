/* import { generateAccessToken, handleResponse } from '../../utils/paypal';

const createOrder = async (cart) => {
    const accessToken = await generateAccessToken();
    const fetch = (await import('node-fetch')).default;
    const url = `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`;
    const payload = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: "10.00",
                },
            },
        ],
    };

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
    });

    return handleResponse(response);
};

export default async (req, res) => {
    if (req.method === 'POST') {
        try {
            const { cart } = req.body;
            const { jsonResponse, httpStatusCode } = await createOrder(cart);
            res.status(httpStatusCode).json(jsonResponse);
        } catch (error) {
            console.error("Failed to create order:", error);
            res.status(500).json({ error: "Failed to create order." });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
 */