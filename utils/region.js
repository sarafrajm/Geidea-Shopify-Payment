
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

module.exports = { getCreteSessionUrl, getHppUrl };