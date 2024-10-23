const mysql = require('mysql2/promise');

async function createConnection() {
    return mysql.createConnection({
        host: 'localhost',    // Your database host
        user: 'root',         // Your database user
        password: '',         // Your database password
        database: 'shopify'    // Your database name
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
    state VARCHAR(255) NOT NULL
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

    try {
        await db.execute(query1);
        await db.execute(query2);
        await db.execute(query3);
        await db.execute(query4);
        db.end();
    } catch (err) {
        db.end();
        console.error("Error while creat table : ", err);
    }
}

async function insertAuthData(data) {
    const db = await createConnection();

    // Default values to empty string if not present in the passed object
    const hmac = data.hmac || '';
    const host = data.host || '';
    const shop = data.shop || '';
    const state = data.state || '';
    const timestamp = data.timestamp || '';

    // Create the SQL query
    const query = `INSERT INTO auth (hmac, host, shop, state, timestamp) VALUES (?, ?, ?, ?, ?)`;

    // Execute the query
    try {
        await db.execute(query, [hmac, host, shop, state, timestamp]);
        db.end();
    } catch (err) {
        console.error('Error inserting data:', err);
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
        console.error('Error getting data:', err);
        db.end();
        return false;
    }
}

async function insertOAuthData(data) {
    const db = await createConnection();

    // Default values to empty string if not present in the passed object
    const code = data.code || '';
    const hmac = data.hmac || '';
    const host = data.host || '';
    const shop = data.shop || '';
    const state = data.state || '';
    const timestamp = data.timestamp || '';

    // Create the SQL query
    const query = `INSERT INTO oauth (code, hmac, host, shop, state, timestamp) VALUES (?, ?, ?, ?, ?, ?)`;

    // Execute the query
    try {
        await db.execute(query, [code, hmac, host, shop, state, timestamp]);
        db.end();
    } catch (err) {
        console.error('Error inserting data:', err);
        db.end();
        return false
    }
    return true;
}

async function insertTokenData(data) {
    const db = await createConnection();

    // Default values to empty string if not present in the passed object
    const shop = data.shop || '';
    const access_token = data.access_token || '';
    const scope = data.scope || '';
    const state = data.state || '';

    // Create the SQL query
    const query = `INSERT INTO token (shop, access_token, scope, state) VALUES (?, ?, ?, ?)`;

    // Execute the query
    try {
        await db.execute(query, [shop, access_token, scope, state]);
        db.end();
    } catch (err) {
        console.error('Error inserting data:', err);
        db.end();
        return false;
    }
    return true;
}

async function getTokenData(shop, state) {
    const db = await createConnection();

    const query = `SELECT * FROM token WHERE shop = ? AND state = ?`;

    try {
        const [results] = await db.execute(query, [shop, state]);
        if (results.length > 0) {
            const response = {
                id: results[0].id,
                shop: results[0].shop,
                access_token: results[0].access_token,
                scope: results[0].scope,
                state: results[0].state
            };
            db.end();
            return response;
        } else {
            db.end();
            return false;
        }
    } catch (err) {
        console.error('Error getting data:', err);
        db.end();
        return false;
    }
}

async function insertMerchantData(data) {
    const db = await createConnection();

    // Default values to empty string if not present in the passed object
    const shop = data.shop || '';
    const access_token = data.access_token || '';
    const scope = data.scope || '';
    const region = data.region || '';
    const publicKey = data.publicKey || '';
    const secretKey = data.secretKey || '';
    const state = data.state || '';

    // Create the SQL query
    const query = `INSERT INTO merchants (shop, access_token, scope, region, publicKey, secretKey, state) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    // Execute the query
    try {
        await db.execute(query, [shop, access_token, scope, region, publicKey, secretKey, state]);
        db.end();
    } catch (err) {
        console.error('Error inserting data:', err);
        db.end();
        return false;
    }
    return true;
}


async function getMerchantData(shop, state) {
    const db = await createConnection();

    const query = `SELECT * FROM merchants WHERE shop = ? AND state = ?`;

    try {
        const [results] = await db.execute(query, [shop, state]);
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
        console.error('Error getting data:', err);
        db.end();
        return false;
    }
}

module.exports = { connectDB, insertAuthData, getAuthData, insertOAuthData, insertTokenData, getTokenData, insertMerchantData, getMerchantData };