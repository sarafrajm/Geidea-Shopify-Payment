const express = require("express");
const crypto = require("crypto");
const { insertOrUpdateAuthData, getAuthData, insertOrUpdateOAuthData, insertOrUpdateTokenData, getTokenData, insertOrUpdateMerchantData, getMerchantData } = require("../../db-operation/db");

const router = new express.Router();

function createQueryString(params) {
    return Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
}

const secureCompare = (digest, hash) => {
    if (digest.length !== hash.length) {
        return false;
    }
    let result = 0;
    for (let i = 0; i < digest.length; i++) {
        result |= digest.charCodeAt(i) ^ hash.charCodeAt(i);
    }
    return result === 0;
};

router.get('/auth', async (req, res) => {
    if (!req.query || !req.query.hmac || !req.query.shop) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid Query"
        })
    }
    const { hmac, ...requiredQuery } = req.query;
    const requiredqueryString = createQueryString(requiredQuery);
    const secret = process.env.SHOPIFY_API_SECRET;
    const digest = crypto
        .createHmac('sha256', secret)
        .update(requiredqueryString)
        .digest('hex');
    const isValid = secureCompare(digest, hmac);

    if (!isValid) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid hmac"
        })
    }
    const shop = req.query.shop;
    const client_id = process.env.SHOPIFY_API_KEY;
    const scopes = process.env.SHOPIFY_API_SCOPES;
    const redirect_uri = req.protocol + '://' + req.get('host') + "/api/oauth";
    const nonce = Date.now().toString(36) + Math.random().toString(36).slice(2);
    if (!(await insertOrUpdateAuthData({ ...req.query, state: nonce }))) {
        return res.status(400).json({
            status: "Failed",
            message: "Error on Data Insert"
        })
    }
    const redirectUrl = `https://${shop}/admin/oauth/authorize?client_id=${client_id}&scope=${scopes}&redirect_uri=${redirect_uri}&state=${nonce}`;
    res.redirect(redirectUrl);
});

router.get('/oauth', async (req, res) => {
    if (!req.query || !req.query.hmac || !req.query.shop || !req.query.state || !req.query.code) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid Query"
        })
    }

    if (!(await getAuthData(req.query.shop, req.query.state))) {
        return res.status(404).json({
            status: "Failed",
            message: "Data not found"
        })
    }

    const { hmac, ...requiredQuery } = req.query;
    const requiredqueryString = createQueryString(requiredQuery);
    const secret = process.env.SHOPIFY_API_SECRET;
    const digest = crypto
        .createHmac('sha256', secret)
        .update(requiredqueryString)
        .digest('hex');
    const isValid = secureCompare(digest, hmac);

    if (!isValid) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid hmac"
        })
    }

    if (!isValidShopifyURL(req.query.shop)) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid Shop Url"
        })
    }

    if (!(await insertOrUpdateOAuthData(req.query))) {
        return res.status(400).json({
            status: "Failed",
            message: "Error on Data Insert"
        })
    }

    const shop = req.query.shop;
    const client_id = process.env.SHOPIFY_API_KEY;
    const client_secret = process.env.SHOPIFY_API_SECRET;
    const authorization_code = req.query.code;
    const jsonData = await fetch(`https://${shop}/admin/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${authorization_code}`, {
        method: "POST"
    })
    try {
        const data = await jsonData.json();
        if (!(await insertOrUpdateTokenData({ ...data, shop: shop, state: req.query.state }))) {
            return res.status(400).json({
                status: "Failed",
                message: "Error on Data Insert"
            })
        }
    } catch (e) {
        return res.status(500).json({
            status: "Failed",
            message: "Internal Server Error"
        })
    }

    res.redirect(`${req.protocol + '://' + req.get('host')}?shop=${shop}&state=${req.query.state}`);
});

router.get('/onboard', async (req, res) => {
    if (!req.query || !req.query.shop || !req.query.state) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid Query"
        })
    }

    if (!(await getTokenData(req.query.shop, req.query.state))) {
        return res.status(404).json({
            status: "Failed",
            message: "Invalid Request"
        })
    }

    const merchantData = await getMerchantData(req.query.shop);

    if (!merchantData) {
        return res.status(404).json({
            status: "Failed",
            message: "Data not found"
        })
    }

    return res.json({
        status: "Success",
        region: merchantData.region,
        publicKey: merchantData.publicKey,
        secretKey: merchantData.secretKey
    })
});

router.post('/onboard', async (req, res) => {
    if (!req.query || !req.body || !req.query.shop || !req.query.state || !req.body.region || !req.body.publicKey || !req.body.secretKey) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid Query"
        })
    }

    const tokenData = await getTokenData(req.query.shop, req.query.state);
    if (!tokenData) {
        return res.status(404).json({
            status: "Failed",
            message: "Invalid Request"
        })
    }

    if (await insertOrUpdateMerchantData({
        shop: req.query.shop,
        access_token: tokenData.access_token,
        scope: tokenData.scope,
        region: req.body.region,
        publicKey: req.body.publicKey,
        secretKey: req.body.secretKey,
        state: req.query.state
    })) {
        return res.json({
            status: "Success",
            region: req.body.region,
            publicKey: req.body.publicKey,
            secretKey: req.body.secretKey
        })
    } else {
        return res.status(400).json({
            status: "Failed",
            message: "Error on Data Insert"
        })
    }
});

function isValidShopifyURL(shop) {
    const regex1 = /^https?\:\/\/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com\/?/
    const regex2 = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/
    return regex1.test(shop) || regex2.test(shop);
}

module.exports = router;