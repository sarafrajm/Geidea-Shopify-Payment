const mysql = require("mysql2/promise");

async function createConnection() {
    return mysql.createConnection({
        host: "localhost",    // Your database host
        user: "root",         // Your database user
        password: "",         // Your database password
        database: "shopify"    // Your database name
    });
}

const connectDB = async () => {
    const db = await createConnection();

    const query1 = `CREATE TABLE IF NOT EXISTS auth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hmac VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL,
    shop VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    timestamp BIGINT NOT NULL
  );`

    const query2 = `CREATE TABLE IF NOT EXISTS oauth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    hmac VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL,
    shop VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    timestamp BIGINT NOT NULL
  );`

    const query3 = `CREATE TABLE IF NOT EXISTS token (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop VARCHAR(255) NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    scope VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    signature VARCHAR(255) NOT NULL,
    timestamp VARCHAR(255) NOT NULL
  );`

    const query4 = `CREATE TABLE IF NOT EXISTS merchants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop VARCHAR(255) NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    scope VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,
    publicKey VARCHAR(255) NOT NULL,
    secretKey VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL
  );`

    const query5 = `CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop VARCHAR(255) NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    shopify_id VARCHAR(255) NOT NULL,
    shopify_gid VARCHAR(255) NOT NULL,
    shopify_session_id VARCHAR(255) NOT NULL,
    shopify_cancel_url VARCHAR(255) NOT NULL,
    sessionId VARCHAR(255) NOT NULL,
    nonce VARCHAR(255) NOT NULL
  );`

    try {
        await db.execute(query1);
        await db.execute(query2);
        await db.execute(query3);
        await db.execute(query4);
        await db.execute(query5);
        db.end();
    } catch (err) {
        db.end();
        console.error("Error while creat table : ", err);
    }
}

async function insertOrUpdateAuthData(data) {
    const db = await createConnection();

    const hmac = data.hmac || "";
    const host = data.host || "";
    const shop = data.shop || "";
    const state = data.state || "";
    const timestamp = data.timestamp || "";

    const checkQuery = `SELECT COUNT(*) as count FROM auth WHERE shop = ?`;
    const insertQuery = `INSERT INTO auth (hmac, host, shop, state, timestamp) VALUES (?, ?, ?, ?, ?)`;
    const updateQuery = `UPDATE auth SET hmac = ?, host = ?, state = ?, timestamp = ? WHERE shop = ?`;

    try {
        const [rows] = await db.execute(checkQuery, [shop]);

        if (rows[0].count > 0) {
            await db.execute(updateQuery, [hmac, host, state, timestamp, shop]);
        } else {
            await db.execute(insertQuery, [hmac, host, shop, state, timestamp]);
        }

        db.end();
    } catch (err) {
        console.error("Error inserting or updating data:", err);
        db.end();
        return false;
    }
    return true;
}

async function getAuthData(shop, state) {
    const db = await createConnection();

    const query = `SELECT * FROM auth WHERE shop = ? AND state = ?`;

    try {
        const [results] = await db.execute(query, [shop, state]);
        if (results.length > 0) {
            const response = {
                id: results[0].id,
                hmac: results[0].hmac,
                host: results[0].host,
                shop: results[0].shop,
                state: results[0].state,
                timestamp: results[0].timestamp
            };
            db.end();
            return response;
        } else {
            db.end();
            return false;
        }
    } catch (err) {
        console.error("Error getting data:", err);
        db.end();
        return false;
    }
}

async function insertOrUpdateOAuthData(data) {
    const db = await createConnection();

    const code = data.code || "";
    const hmac = data.hmac || "";
    const host = data.host || "";
    const shop = data.shop || "";
    const state = data.state || "";
    const timestamp = data.timestamp || "";

    const checkQuery = `SELECT COUNT(*) as count FROM oauth WHERE shop = ?`;

    const insertQuery = `INSERT INTO oauth (code, hmac, host, shop, state, timestamp) VALUES (?, ?, ?, ?, ?, ?)`;
    const updateQuery = `UPDATE oauth SET code = ?, hmac = ?, host = ?, state = ?, timestamp = ? WHERE shop = ?`;

    try {
        const [rows] = await db.execute(checkQuery, [shop]);

        if (rows[0].count > 0) {
            await db.execute(updateQuery, [code, hmac, host, state, timestamp, shop]);
        } else {
            await db.execute(insertQuery, [code, hmac, host, shop, state, timestamp]);
        }

        db.end();
    } catch (err) {
        console.error("Error inserting or updating data:", err);
        db.end();
        return false;
    }
    return true;
}

async function insertOrUpdateTokenData(data) {
    const db = await createConnection();

    const shop = data.shop || "";
    const access_token = data.access_token || "";
    const scope = data.scope || "";
    const state = data.state || "";
    const signature = data.signature || "";
    const timestamp = data.timestamp || "";

    const checkQuery = `SELECT COUNT(*) as count FROM token WHERE shop = ?`;

    const insertQuery = `INSERT INTO token (shop, access_token, scope, state, signature, timestamp) VALUES (?, ?, ?, ?, ?, ?)`;
    const updateQuery = `UPDATE token SET access_token = ?, scope = ?, state = ?, signature = ?, timestamp = ? WHERE shop = ?`;

    try {
        const [rows] = await db.execute(checkQuery, [shop]);

        if (rows[0].count > 0) {
            await db.execute(updateQuery, [access_token, scope, state, signature, timestamp, shop]);
        } else {
            await db.execute(insertQuery, [shop, access_token, scope, state, signature, timestamp]);
        }

        db.end();
    } catch (err) {
        console.error("Error inserting or updating data:", err);
        db.end();
        return false;
    }
    return true;
}


async function getTokenData(shop, state, signature) {
    const db = await createConnection();

    const query = `SELECT * FROM token WHERE shop = ? AND state = ? AND signature = ?`;

    try {
        const [results] = await db.execute(query, [shop, state, signature]);
        if (results.length > 0) {
            const response = {
                id: results[0].id,
                shop: results[0].shop,
                access_token: results[0].access_token,
                scope: results[0].scope,
                state: results[0].state,
                signature: results[0].signature,
                timestamp: results[0].timestamp
            };
            db.end();
            return response;
        } else {
            db.end();
            return false;
        }
    } catch (err) {
        console.error("Error getting data:", err);
        db.end();
        return false;
    }
}

async function insertOrUpdateMerchantData(data) {
    const db = await createConnection();

    const shop = data.shop || "";
    const access_token = data.access_token || "";
    const scope = data.scope || "";
    const region = data.region || "";
    const publicKey = data.publicKey || "";
    const secretKey = data.secretKey || "";
    const state = data.state || "";

    const checkQuery = `SELECT COUNT(*) as count FROM merchants WHERE shop = ?`;

    const insertQuery = `INSERT INTO merchants (shop, access_token, scope, region, publicKey, secretKey, state) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const updateQuery = `UPDATE merchants SET access_token = ?, scope = ?, region = ?, publicKey = ?, secretKey = ?, state = ? WHERE shop = ?`;

    try {
        const [rows] = await db.execute(checkQuery, [shop]);

        if (rows[0].count > 0) {
            await db.execute(updateQuery, [access_token, scope, region, publicKey, secretKey, state, shop]);
        } else {
            await db.execute(insertQuery, [shop, access_token, scope, region, publicKey, secretKey, state]);
        }

        db.end();
    } catch (err) {
        console.error("Error inserting or updating data:", err);
        db.end();
        return false;
    }
    return true;
}

async function getMerchantData(shop) {
    const db = await createConnection();

    const query = `SELECT * FROM merchants WHERE shop = ?`;

    try {
        const [results] = await db.execute(query, [shop]);
        if (results.length > 0) {
            const response = {
                id: results[0].id,
                shop: results[0].shop,
                access_token: results[0].access_token,
                scope: results[0].scope,
                region: results[0].region,
                publicKey: results[0].publicKey,
                secretKey: results[0].secretKey,
                state: results[0].state
            };
            db.end();
            return response;
        } else {
            db.end();
            return false;
        }
    } catch (err) {
        console.error("Error getting data:", err);
        db.end();
        return false;
    }
}

async function insertOrUpdatePaymentData(data) {
    const db = await createConnection();
    if (!data.shop || !data.access_token || !data.sessionId) {
        console.error("Paymend data is not valid [insertPaymentData]");
        return false;
    }

    const shop = data.shop || "";
    const access_token = data.access_token || "";
    const shopify_id = data.shopify_id || "";
    const shopify_gid = data.shopify_gid || "";
    const shopify_session_id = data.shopify_session_id || "";
    const shopify_cancel_url = data.shopify_cancel_url || "";
    const sessionId = data.sessionId || "";
    const nonce = data.nonce || "";

    const checkQuery = `SELECT COUNT(*) as count FROM payments WHERE sessionId = ?`;

    const insertQuery = `INSERT INTO payments (shop, access_token, shopify_id, shopify_gid, shopify_session_id, shopify_cancel_url, sessionId, nonce) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const updateQuery = `UPDATE payments SET shop = ?, access_token = ?, shopify_id = ?, shopify_gid = ?, shopify_session_id = ?, shopify_cancel_url = ?, nonce = ? WHERE sessionId = ?`;

    try {
        const [rows] = await db.execute(checkQuery, [sessionId]);

        if (rows[0].count > 0) {
            await db.execute(updateQuery, [shop, access_token, shopify_id, shopify_gid, shopify_session_id, shopify_cancel_url, nonce, sessionId]);
        } else {
            await db.execute(insertQuery, [shop, access_token, shopify_id, shopify_gid, shopify_session_id, shopify_cancel_url, sessionId, nonce]);
        }

        db.end();
    } catch (err) {
        console.error("Error inserting or updating data:", err);
        db.end();
        return false;
    }
    return true;
}

async function getPaymentData(sessionId, nonce) {
    const db = await createConnection();

    const query = `SELECT * FROM payments WHERE sessionId = ? AND nonce = ?`;

    try {
        const [results] = await db.execute(query, [sessionId, nonce]);
        if (results.length > 0) {
            const response = {
                id: results[0].id,
                shop: results[0].shop,
                access_token: results[0].access_token,
                shopify_id: results[0].shopify_id,
                shopify_gid: results[0].shopify_gid,
                shopify_session_id: results[0].shopify_session_id,
                shopify_cancel_url: results[0].shopify_cancel_url,
                sessionId: results[0].sessionId,
                nonce: results[0].nonce
            };
            db.end();
            return response;
        } else {
            db.end();
            return false;
        }
    } catch (err) {
        console.error("Error getting data:", err);
        db.end();
        return false;
    }
}

module.exports = {
    connectDB,
    insertOrUpdateAuthData,
    getAuthData,
    insertOrUpdateOAuthData,
    insertOrUpdateTokenData,
    getTokenData,
    insertOrUpdateMerchantData,
    getMerchantData,
    insertOrUpdatePaymentData,
    getPaymentData
};