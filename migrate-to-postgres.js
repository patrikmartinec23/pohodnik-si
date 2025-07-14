#!/usr/bin/env node
/**
 * MySQL to PostgreSQL Migration Helper Script
 *
 * This script helps with exporting MySQL data and preparing it for PostgreSQL import
 * It uses knex.js to connect to your database directly rather than relying on external MySQL CLI
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const knex = require('knex');

// Configuration from .env file
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'pohodniki';
const EXPORT_DIR = './db_export';

// Setup database connection
const db = knex({
    client: 'mysql2',
    connection: {
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
    },
});

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR);
}

// Helper function to escape CSV fields
function escapeCsvField(field) {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// Helper function to write CSV files
function writeDataToCsv(data, columns, fileName) {
    try {
        // Write header
        const header = columns.join(',') + '\n';
        fs.writeFileSync(fileName, header);

        // Write data rows
        const rows = data
            .map((row) =>
                columns.map((col) => escapeCsvField(row[col])).join(',')
            )
            .join('\n');

        fs.appendFileSync(fileName, rows);
        return true;
    } catch (error) {
        console.error(`Error writing CSV file: ${error.message}`);
        return false;
    }
}

// Get table list from MySQL using knex
console.log('Getting table list from MySQL...');
async function exportTables() {
    try {
        // Get all tables
        const tablesResult = await db.raw('SHOW TABLES');
        const tables = tablesResult[0].map((row) => Object.values(row)[0]);

        console.log(`Found ${tables.length} tables.`);

        // Export each table
        console.log('\nExporting tables to CSV...');

        for (const table of tables) {
            const fileName = path.join(EXPORT_DIR, `${table}.csv`);
            console.log(`Exporting table ${table} to ${fileName}`);

            try {
                // Get columns
                const columnsResult = await db.raw(
                    `SHOW COLUMNS FROM ${table}`
                );
                const columns = columnsResult[0].map((col) => col.Field);

                // Get data
                const data = await db(table).select('*');

                // Write to CSV
                if (writeDataToCsv(data, columns, fileName)) {
                    console.log(
                        `✅ Successfully exported ${table} with ${data.length} rows`
                    );
                } else {
                    console.error(`❌ Failed to export ${table}`);
                }
            } catch (error) {
                console.error(`❌ Error exporting ${table}: ${error.message}`);
            }
        }

        // Generate SQL reset sequence commands
        let resetSequencesSQL =
            '-- Run these commands after importing data to reset sequences\n';

        for (const table of tables) {
            // PostgreSQL sequences are named tablename_columnname_seq
            // We're assuming the primary key follows the IDTableName pattern
            const primaryKeyColumn = `ID${
                table.charAt(0).toUpperCase() + table.slice(1)
            }`;
            resetSequencesSQL += `SELECT setval('${table.toLowerCase()}_${primaryKeyColumn.toLowerCase()}_seq', (SELECT MAX(${primaryKeyColumn}) FROM "${table}"));\n`;
        }

        fs.writeFileSync(
            path.join(EXPORT_DIR, 'reset_sequences.sql'),
            resetSequencesSQL
        );

        console.log('\n✅ Export complete!');
        console.log(`CSV files have been saved to the ${EXPORT_DIR} directory`);
        console.log('\nNext steps:');
        console.log(
            '1. Upload these CSV files to Supabase via the Table Editor'
        );
        console.log(
            `2. Run the SQL commands in ${EXPORT_DIR}/reset_sequences.sql to reset the sequences`
        );

        // Close database connection
        await db.destroy();
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        console.error(
            'Make sure MySQL is running and your credentials are correct.'
        );
        process.exit(1);
    }
}

// Run the export function
exportTables().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
