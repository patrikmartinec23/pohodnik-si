// This file will be used for production with Supabase
// It replaces the MySQL configuration with PostgreSQL for Supabase
require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.render' : '.env' });
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Environment variables in db.prod.js:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SUPABASE_URL:', supabaseUrl);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is not set');
}
if (!supabaseKey) {
    throw new Error('SUPABASE_KEY environment variable is not set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// We'll also keep knex for query building
const knex = require('knex');

// Configure knex for PostgreSQL
const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }, // Required for Supabase
    },
});

module.exports = { db, supabase };
