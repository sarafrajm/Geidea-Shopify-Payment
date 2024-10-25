const express = require("express");
const { getMerchantData, getPaymentData } = require("../../db-operation/db");
const router = new express.Router();

router.post("/callback", async (req, res) => {
    // console.log(req.body);;
    // console.log(req.query);
    res.json({
        status: "Success"
    });
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
        return res.status(301).redirect(data.shopify_cancel_url);
    }

    console.log(req.query);
    console.log(data);

    return res.json({
        "status": "Ok"
    });
});

module.exports = router;