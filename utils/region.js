
function getCreteSessionUrl(region) {
    let createSessionUrl;
    if (region === "EGY") {
        createSessionUrl = "https://api.merchant.geidea.net/payment-intent/api/v2/direct/session";
    } else if (region === "UAE") {
        createSessionUrl = "https://api.geidea.ae/payment-intent/api/v2/direct/session";
    } else if (region === "KSA") {
        createSessionUrl = "https://api.ksamerchant.geidea.net/payment-intent/api/v2/direct/session";
    }
    return createSessionUrl;
}

// https://api.merchant.geidea.net/pgw/api/v1/config

async function getMerchnatConfig(region, merchnatId) {
    let configUrl;
    if (region === "EGY") {
        configUrl = `https://api.merchant.geidea.net/pgw/api/v1/config/${merchnatId}`;
    } else if (region === "UAE") {
        configUrl = `https://api.geidea.ae/pgw/api/v1/config/${merchnatId}`;
    } else if (region === "KSA") {
        configUrl = `https://api.ksamerchant.geidea.net/pgw/api/v1/config/${merchnatId}`;
    }
    try {
        const response = await fetch(configUrl);
        const result = await response.json();
        if (result?.currencies) {
            return result;
        } else {
            return false;
        }
    } catch (err) {
        console.error("Error while checking merchnat config : ", err);
        return false;
    }
}

function getHppUrl(region, sessionId) {
    let hppUrl;
    if (region === "EGY") {
        hppUrl = `https://www.merchant.geidea.net/hpp/checkout/?${sessionId}`;
    } else if (region === "UAE") {
        hppUrl = `https://www-uae-dev.gd-azure-dev.net/hpp/checkout/?${sessionId}`;
    } else if (region === "KSA") {
        hppUrl = `https://www.ksamerchant.geidea.net/hpp/checkout/?${sessionId}`;
    }
    return hppUrl;
}

function getRefundUrl(region) {
    let refundUrl;
    if (region === "EGY") {
        refundUrl = "https://api.merchant.geidea.net/pgw/api/v2/direct/refund";
    } else if (region === "UAE") {
        refundUrl = "https://api.geidea.ae/pgw/api/v2/direct/refund";
    } else if (region === "KSA") {
        refundUrl = "https://api.ksamerchant.geidea.net/pgw/api/v2/direct/refund";
    }
    return refundUrl;
}

module.exports = { getCreteSessionUrl, getHppUrl, getMerchnatConfig, getRefundUrl };