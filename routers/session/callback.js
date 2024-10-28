const express = require("express");
const { getMerchantData, getPaymentData } = require("../../db-operation/db");
const { callGraphqlApi } = require("../../utils/utils");
const router = new express.Router();

router.post("/callback", async (req, res) => {
    if (!req.query || !req.query.nonce || !req.body || !req.body.order || !req.body.order?.sessionId || !req.body.order?.orderId) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid Inputs"
        });
    }
    const order = req.body.order;
    const data = await getPaymentData(order.sessionId, req.query.nonce);
    if (!data) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid Request"
        });
    }

    if (req.body.order?.status == "Success" && req.body.order?.detailedStatus == "Paid") {
        const graphqlQuery = `
            mutation paymentSessionResolve($id: ID!, $networkTransactionId: String!) {
                paymentSessionResolve(id: $id, networkTransactionId: $networkTransactionId) {
                    paymentSession {
                        authorizationExpiresAt
                        id
                        nextAction {
                            action
                            context {
                                __typename
                                ... on PaymentSessionActionsRedirect {
                                    redirectUrl
                                }
                            }
                        }
                        pendingExpiresAt
                        state {
                            __typename
                            ... on PaymentSessionStateConfirming {
                                code
                            }
                            ... on PaymentSessionStatePending {
                                code
                                reason
                            }
                            ... on PaymentSessionStateRedirecting {
                                code
                            }
                            ... on PaymentSessionStateRejected {
                                code
                                merchantMessage
                                reason
                            }
                            ... on PaymentSessionStateResolved {
                                code
                            }
                        }
                    }
                    userErrors {
                    field
                    message
                    }
                }
            }
        `;

        const graphqlVariables = {
            "id": data.shopify_gid,
            "networkTransactionId": req.body.order?.orderId
        }

        const [isSuccess, result] = await callGraphqlApi(data.shop, data.access_token, graphqlQuery, graphqlVariables);
        console.log(JSON.stringify(result));

        if (isSuccess) {
            return res.status(200).json({
                "status": "Success",
                "message": "Order Updated"
            });
        } else {
            return res.status(400).json({
                "status": "Failed",
                "message": "Order Not Updated"
            });
        }
    } else {
        console.log(req.body);
        return res.status(200).json({
            "status": "Success",
            "message": "Order Not Updated"
        });
    }
});

router.get("/callback", async (req, res) => {
    if (!req.query || !req.query.sessionId || !req.query.nonce || !req.query.responseMessage) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid Query"
        })
    }
    const data = await getPaymentData(req.query.sessionId, req.query.nonce);
    if (!data) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid Request"
        })
    }
    if (req.query.responseMessage == "Cancelled by User") {
        return res.status(200).redirect(data.shopify_cancel_url);
    }


    if (req.query.responseMessage == "Success") {
        const graphqlQuery = `
            mutation paymentSessionResolve($id: ID!, $networkTransactionId: String!) {
                paymentSessionResolve(id: $id, networkTransactionId: $networkTransactionId) {
                    paymentSession {
                        authorizationExpiresAt
                        id
                        nextAction {
                            action
                            context {
                                __typename
                                ... on PaymentSessionActionsRedirect {
                                    redirectUrl
                                }
                            }
                        }
                        pendingExpiresAt
                        state {
                            __typename
                            ... on PaymentSessionStateConfirming {
                                code
                            }
                            ... on PaymentSessionStatePending {
                                code
                                reason
                            }
                            ... on PaymentSessionStateRedirecting {
                                code
                            }
                            ... on PaymentSessionStateRejected {
                                code
                                merchantMessage
                                reason
                            }
                            ... on PaymentSessionStateResolved {
                                code
                            }
                        }
                    }
                    userErrors {
                    field
                    message
                    }
                }
            }
        `;

        const graphqlVariables = {
            "id": data.shopify_gid,
            "networkTransactionId": req.query.orderId
        }

        const [isSuccess, result] = await callGraphqlApi(data.shop, data.access_token, graphqlQuery, graphqlVariables);

        if (isSuccess) {
            if (result?.data?.paymentSessionResolve?.paymentSession?.nextAction?.action == "REDIRECT") {
                return res.status(301).redirect(result?.data?.paymentSessionResolve?.paymentSession?.nextAction?.context?.redirectUrl);
            } else if (result?.data?.paymentSessionResolve?.userErrors.length > 0) {
                return res.status(400).json({
                    "status": "Failed",
                    "message": result?.data?.paymentSessionResolve?.userErrors?.[0]?.message
                });
            }
        } else {
            return res.status(500).json({
                "status": "Failed",
                "message": "Something went wrong!"
            });
        }
    }

    return res.status(200).redirect(data.shopify_cancel_url);
});

module.exports = router;