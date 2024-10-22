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
    merchant_key VARCHAR(255) NOT NULL,
    merchant_secret_key VARCHAR(255) NOT NULL
  );`

    try {
        await db.execute(query1);
        await db.execute(query2);
        await db.execute(query3);
        db.end();
    } catch (err) {
        db.end();
        console.log("Error while creat table : ", err);
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

module.exports = { connectDB, insertAuthData, getAuthData, insertOAuthData };