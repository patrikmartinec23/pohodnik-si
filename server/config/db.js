const mysql = require('mysql2/promise');
require('dotenv').config();

async function povezava() {
    try {
        return await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            // Add these options for better compatibility
            authPlugins: {
                mysql_native_password: () =>
                    require('mysql2/lib/auth/mysql_native_password.js')(),
            },
        });
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}

module.exports = povezava;
