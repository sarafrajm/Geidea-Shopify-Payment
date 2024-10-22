const express = require("express");
const crypto = require("crypto");
const { insertAuthData, getAuthData, insertOAuthData } = require("../../db-operation/db");

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
    if (!insertAuthData({ ...req.query, state: nonce })) {
        return res.status(400).json({
            status: "Failed",
            message: "Error on Data Insert"
        })
    }
    const redirectUrl = `https://${shop}/admin/oauth/authorize?client_id=${client_id}&scope=${scopes}&redirect_uri=${redirect_uri}&state=${nonce}`;
    res.redirect(redirectUrl);
})

router.get('/oauth', async (req, res) => {
    if (!req.query || !req.query.hmac || !req.query.shop || !req.query.state || !req.query.code) {
        return res.status(400).json({
            status: "Failed",
            message: "Invalid Query"
        })
    }

    if (!getAuthData(req.query.shop, req.query.state)) {
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

    if (!insertOAuthData(req.query)) {
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
        console.log(data);
    } catch (e) {

    }

    res.redirect(process.env.SHOPIFY_FRONTEND);
})

function isValidShopifyURL(shop) {
    const regex1 = /^https?\:\/\/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com\/?/
    const regex2 = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/
    return regex1.test(shop) || regex2.test(shop);
}

module.exports = router;