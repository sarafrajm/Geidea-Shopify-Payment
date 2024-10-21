const express = require("express");
const router = new express.Router();

router.get('/session', async (req, res) => {
    res.json({
        "test": false
    })
})

module.exports = router;