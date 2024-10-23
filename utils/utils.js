const crypto = require('crypto');

function maskInput(input) {
    if (input.length <= 8) {
        return input;
    }
    const firstPart = input.slice(0, 3);
    const lastPart = input.slice(-5);
    const maskedPart = '*'.repeat(input.length - 8);
    return firstPart + maskedPart + lastPart;
}

function createSignature(data, secretKey) {
    const timestamp = Math.floor(Date.now() / 1000);

    const payload = `${data}|${timestamp}`;

    const signature = crypto
        .createHmac('sha256', secretKey)
        .update(payload)
        .digest('hex');

    return { signature, timestamp };
}

function validateSignature(data, secretKey, signature, timestamp) {
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;

    if (currentTime - timestamp > fiveMinutes) {
        return false;
    }

    const payload = `${data}|${timestamp}`;
    const validSignature = crypto
        .createHmac('sha256', secretKey)
        .update(payload)
        .digest('hex');

    return validSignature === signature;
}


module.exports = { createSignature, validateSignature, maskInput };