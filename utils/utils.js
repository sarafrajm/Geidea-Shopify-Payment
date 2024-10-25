const crypto = require("crypto");

function maskInput(input) {
    if (input.length <= 8) {
        return input;
    }
    const firstPart = input.slice(0, 3);
    const lastPart = input.slice(-5);
    const maskedPart = "*".repeat(input.length - 8);
    return firstPart + maskedPart + lastPart;
}

function createSignature(data, secretKey) {
    const timestamp = Math.floor(Date.now() / 1000);

    const payload = `${data}|${timestamp}`;

    const signature = crypto
        .createHmac("sha256", secretKey)
        .update(payload)
        .digest("hex");

    return { signature, timestamp };
}

function validateSignature(data, secretKey, signature, timestamp) {
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutes = 3 * 60;

    if (currentTime - timestamp > fiveMinutes) {
        return false;
    }

    const payload = `${data}|${timestamp}`;
    const validSignature = crypto
        .createHmac("sha256", secretKey)
        .update(payload)
        .digest("hex");

    return validSignature === signature;
}

function getFormatedDate() {
    // Generate timestamp
    const now = new Date();
    const month = String(now.getMonth() + 1);
    const day = String(now.getDate());
    const year = String(now.getFullYear());
    const timestamp = `${month}/${day}/${year} ${now.toLocaleTimeString("en-US", { hour12: true })}`;
    return timestamp;
}

function formatName(name1, name2) {
    if (name1) {
        return name1;
    }
    if (name2) {
        return name2;
    }
    return null;
}

async function callGraphqlApi(shopDomain, accessToken, graphqlQuery, graphqlVariables) {
    const url = `https://${shopDomain}/payments_apps/api/2022-10/graphql.json`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken
            },
            body: JSON.stringify({
                query: graphqlQuery,
                variables: graphqlVariables
            })
        });

        const result = await response.json();
        return [true, result];
    } catch (error) {
        console.error("Error Calling Graphpql Api: ", error);
        return [false, "Error Calling Graphpql Api"]
    }


}

function converCountryCode2DigitTo3Digit(code) {
    const upperCode = code.toUpperCase();
    try {
        const countries = require("i18n-iso-countries");
        countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
        return countries.alpha2ToAlpha3(upperCode) || upperCode;
    } catch (err) {
        return upperCode
    }
}

module.exports = { createSignature, validateSignature, maskInput, getFormatedDate, formatName, callGraphqlApi, converCountryCode2DigitTo3Digit };