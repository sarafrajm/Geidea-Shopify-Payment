const express = require("express");
const { getMerchantData, insertOrUpdatePaymentData } = require("../../db-operation/db");
const { getCreteSessionUrl, getHppUrl } = require("../../utils/region");
const { getFormatedDate, formatName, converCountryCode2DigitTo3Digit } = require("../../utils/utils");
const router = new express.Router();

router.post("/session", async (req, res) => {
    const ShopifyShopDomain = req.get("Shopify-Shop-Domain");
    const ShopifyRequestId = req.get("Shopify-Request-Id");
    const ShopifyApiVersion = req.get("Shopify-Api-Version");
    const requestBody = req.body;
    if (!ShopifyShopDomain, !ShopifyApiVersion) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid Request"
        })
    }

    const merchantData = await getMerchantData(ShopifyShopDomain);
    if (!merchantData) {
        return res.status(404).json({
            status: "Failed",
            message: "Invalid Merchant"
        })
    }
    const createSessionUrl = getCreteSessionUrl(merchantData.region);
    req.protocol = "https";
    const callbackUrl = `${"https"}://${req.get("host")}/api/callback`;
    const nonce = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const returnUrl = `${"https"}://${req.get("host")}/api/callback?nonce=${nonce}`;
    // const callbackUrl = "https://webhook.site/43fdd08e-5f86-43d0-962c-7ff15edb2829";  // Will update

    const merchantPublicKey = merchantData.publicKey;
    const amount = String(parseFloat(requestBody.amount).toFixed(2));
    const currency = requestBody.currency;
    const merchantReferenceId = requestBody.id;
    const timestamp = getFormatedDate();
    const merchantSecretKey = merchantData.secretKey;

    // Generate Signature
    const strData = merchantPublicKey + amount + currency + merchantReferenceId + timestamp;
    const hash = require("crypto-js").HmacSHA256(strData, merchantSecretKey);
    const signature = require("crypto-js").enc.Base64.stringify(hash);

    const sessionData = {
        "merchantPublicKey": merchantPublicKey,
        "apiPassword": merchantSecretKey,
        "callbackUrl": callbackUrl,
        "returnUrl": returnUrl,
        "amount": amount,
        "currency": currency,
        "language": "en",
        "timestamp": timestamp,
        "merchantReferenceId": merchantReferenceId,
        "paymentIntentId": null,
        "paymentOperation": "Pay",
        "initiatedBy": "Internet",
        "cardOnFile": false,
        "tokenId": null,
        "customer": {
            "create": false,
            "setDefaultMethod": false,
            "email": requestBody.customer?.email ? requestBody.customer.email : null,
            "phoneNumber": requestBody.customer?.phone_number ? (requestBody.customer?.phone_number[0] == "+" ? requestBody.customer?.phone_number : "+" + requestBody.customer?.phone_number) : null,
            "firstName": formatName(requestBody.customer?.billing_address?.given_name, requestBody.customer?.shipping_address?.given_name),
            "lastName": formatName(requestBody.customer?.billing_address?.family_name, requestBody.customer?.shipping_address?.family_name),
            "address": {
                "billing": {
                    "city": formatName(requestBody.customer?.billing_address?.city, requestBody.customer?.shipping_address?.city),
                    "country": formatName(converCountryCode2DigitTo3Digit(requestBody.customer?.billing_address?.country_code), converCountryCode2DigitTo3Digit(requestBody.customer?.shipping_address?.country_code)),
                    "postalCode": formatName(requestBody.customer?.billing_address?.postal_code, requestBody.customer?.shipping_address?.postal_code),
                    "street": formatName(requestBody.customer?.billing_address?.line1, requestBody.customer?.shipping_address?.line1)
                },
                "shipping": {
                    "city": formatName(requestBody.customer?.shipping_address?.city, requestBody.customer?.billing_address?.city),
                    "country": formatName(converCountryCode2DigitTo3Digit(requestBody.customer?.shipping_address?.country_code), converCountryCode2DigitTo3Digit(requestBody.customer?.billing_address?.country_code)),
                    "postalCode": formatName(requestBody.customer?.shipping_address?.postal_code, requestBody.customer?.billing_address?.postal_code),
                    "street": formatName(requestBody.customer?.shipping_address?.line1, requestBody.customer?.billing_address?.line1)
                }
            }
        },
        "appearance": {
            "showAddress": false,
            "showEmail": false,
            "showPhone": false,
            "receiptPage": false,
            "merchant": {
                "logoUrl": null
            },
            "styles": {
                "headerColor": null,
                "hppProfile": null,
                "hideGeideaLogo": false
            },
            "uiMode": "modal"
        },
        "order": {
            "integrationType": "plugin"
        },
        "platform": {
            "name": "Shopify",
            "version": "1.0.0",
            "pluginVersion": "1.0.0",
            "partnerId": null
        },
        "signature": signature
    }

    const credentials = `${merchantData.publicKey}:${merchantData.secretKey}`;
    const response = await fetch(createSessionUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${btoa(credentials)}`
        },
        body: JSON.stringify(sessionData)
    });
    const result = await response.json();

    if (response.status == 200 && result.session?.id) {
        if (await insertOrUpdatePaymentData({
            shop: merchantData.shop,
            access_token: merchantData.access_token,
            shopify_id: requestBody.id,
            shopify_gid: requestBody.gid,
            shopify_session_id: requestBody.session_id,
            shopify_cancel_url: requestBody.payment_method?.data?.cancel_url,
            sessionId: result.session.id,
            nonce: nonce
        })) {
            res.status(200).json({
                "redirect_url": getHppUrl(merchantData.region, result.session.id)
            });
        } else {
            return res.status(400).json({
                status: "Failed",
                message: "Error on Data Insert"
            });
        }
    } else {
        res.status(response.status).json(result);
    }
})

module.exports = router;