/* "use client";

import React, { useEffect, useState } from "react";

const PayPalButton = () => {
    const [sdkReady, setSdkReady] = useState(false);

    useEffect(() => {
        const scriptId = "paypal-sdk";
        const existingScript = document.getElementById(scriptId);

        if (!existingScript) {
            const script = document.createElement("script");
            script.src = "https://www.paypal.com/sdk/js?client-id=AVPNYLG6EitH66wt5UZZFbRVoRgZ5EQyp68GLqXt11lGNiTxkuhiTstmnePyPSw3KZL6fZCOo_27Nvgp&currency=USD";
            script.id = scriptId;
            script.async = true;
            script.onload = () => {
                console.log("PayPal SDK loaded");
                setSdkReady(true);
            };
            script.onerror = () => {
                console.error("Failed to load PayPal SDK");
            };
            document.body.appendChild(script);
        } else {
            console.log("PayPal SDK already exists");
            setSdkReady(true);
        }

        return () => {
            const container = document.querySelector("#paypal-button-container");
            if (container) container.innerHTML = "";
        };
    }, []);

    useEffect(() => {
        if (sdkReady) {
            initializePayPalButtons();
        }
    }, [sdkReady]);

    const initializePayPalButtons = () => {
        if (window.paypal) {
            window.paypal.Buttons({
                createOrder: async () => {
                    try {
                        const response = await fetch("/orders", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                cart: [
                                    {
                                        id: "YOUR_PRODUCT_ID",
                                        quantity: "YOUR_PRODUCT_QUANTITY",
                                    },
                                ],
                            }),
                        });

                        const orderData = await response.json();

                        if (orderData.id) {
                            return orderData.id;
                        } else {
                            const errorDetail = orderData?.details?.[0];
                            const errorMessage = errorDetail
                                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                                : JSON.stringify(orderData);

                            throw new Error(errorMessage);
                        }
                    } catch (error) {
                        console.error(error);
                        resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
                    }
                },
                onApprove: async (data, actions) => {
                    try {
                        const response = await fetch(`/${data.orderID}/capture`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        });

                        const orderData = await response.json();
                        const errorDetail = orderData?.details?.[0];

                        if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                            return actions.restart();
                        } else if (errorDetail) {
                            throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
                        } else if (!orderData.purchase_units) {
                            throw new Error(JSON.stringify(orderData));
                        } else {
                            const transaction =
                                orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
                                orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
                            resultMessage(
                                `Transaction ${transaction.status}: ${transaction.id}<br><br>See console for all available details`
                            );
                            console.log("Capture result", orderData, JSON.stringify(orderData, null, 2));
                        }
                    } catch (error) {
                        console.error(error);
                        resultMessage(`Sorry, your transaction could not be processed...<br><br>${error}`);
                    }
                },
            }).render("#paypal-button-container");
        } else {
            console.error("PayPal SDK not loaded.");
        }
    };

    const resultMessage = (message) => {
        const container = document.querySelector("#result-message");
        if (container) {
            container.innerHTML = message;
        }
    };

    return (
        <div>
            <div id="paypal-button-container"></div>
            <p id="result-message"></p>
        </div>
    );
};

export default PayPalButton;
 */