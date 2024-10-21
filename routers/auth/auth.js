const express = require("express");
const crypto = require("crypto");
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
    return res.status(400).json({
        status: "Failed"
    })
    if (!req.query || !req.query.hmac || !req.query.shop) {
        return res.status(400).json({
            status: "Failed"
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
            status: "Failed"
        })
    }
    const shop = req.query.shop;
    const client_id = process.env.SHOPIFY_API_KEY;
    const scopes = process.env.SHOPIFY_API_SCOPES;
    const redirect_uri = req.protocol + '://' + req.get('host') + "/api/oauth";
    const nonce = "rajisgood";  //need to do
    const redirectUrl = `https://${shop}/admin/oauth/authorize?client_id=${client_id}&scope=${scopes}&redirect_uri=${redirect_uri}&state=${nonce}`;
    res.redirect(redirectUrl);
})

router.get('/oauth', async (req, res) => {
    if (!req.query || !req.query.hmac || !req.query.shop || !req.query.state || !req.query.code) {
        return res.status(400).json({
            status: "Failed"
        })
    }

    // nonce verification  // need to do
    // req.query.state

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
            status: "Failed"
        })
    }

    // verify shop url is valid // need to do
    // req.query.shop

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

    res.redirect('http://localhost:3000'); //frontend
})

module.exports = router;