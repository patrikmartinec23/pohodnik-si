// This file will be used for production with Supabase
// It replaces the MySQL configuration with PostgreSQL for Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
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
