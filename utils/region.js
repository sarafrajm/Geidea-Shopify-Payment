
function getCreteSessionUrl(region) {
    let createSessionUrl;
    if (region === 'EGY') {
        createSessionUrl = 'https://api.merchant.geidea.net/payment-intent/api/v2/direct/session';
    } else if (region === 'EGY-PREPROD') {
        createSessionUrl = 'https://api-merchant.staging.geidea.net/payment-intent/api/v2/direct/session';
    } else if (region === 'UAE') {
        createSessionUrl = 'https://api.geidea.ae/payment-intent/api/v2/direct/session';
    } else if (region === 'UAE-PREPROD') {
        createSessionUrl = 'https://api-merchant.staging.geidea.ae/payment-intent/api/v2/direct/session';
    } else if (region === 'KSA') {
        createSessionUrl = 'https://api.ksamerchant.geidea.net/payment-intent/api/v2/direct/session';
    } else if (region === 'KSA-PREPROD') {
        createSessionUrl = 'https://api-ksamerchant.staging.geidea.net/payment-intent/api/v2/direct/session';
    }
    return createSessionUrl;
}

function getHppUrl(region, sessionId) {
    let hppUrl;
    if (region === 'EGY') {
        hppUrl = 'https://api.merchant.geidea.net/payment-intent/api/v2/direct/session';
    } else if (region === 'EGY-PREPROD') {
        hppUrl = 'https://api-merchant.staging.geidea.net/payment-intent/api/v2/direct/session';
    } else if (region === 'UAE') {
        hppUrl = 'https://api.geidea.ae/payment-intent/api/v2/direct/session';
    } else if (region === 'UAE-PREPROD') {
        hppUrl = 'https://api-merchant.staging.geidea.ae/payment-intent/api/v2/direct/session';
    } else if (region === 'KSA') {
        hppUrl = 'https://api.ksamerchant.geidea.net/payment-intent/api/v2/direct/session';
    } else if (region === 'KSA-PREPROD') {
        hppUrl = 'https://api-ksamerchant.staging.geidea.net/payment-intent/api/v2/direct/session';
    }
    return hppUrl;
}

module.exports = { getCreteSessionUrl, getHppUrl };