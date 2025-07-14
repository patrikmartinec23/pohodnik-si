#!/usr/bin/env node
/**
 * Fix CSV Headers for Supabase Import
 *
 * This script adjusts CSV headers to match the case sensitivity of PostgreSQL/Supabase tables
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify/sync');

const EXPORT_DIR = './db_export';
const FIXED_EXPORT_DIR = './db_export_fixed';

// Mapping of table names from lowercase to proper case as defined in Supabase
const tableMapping = {
    uporabnik: 'Uporabnik',
    pohodnik: 'Pohodnik',
    pohodniskodrustvo: 'PohodniskoDrustvo',
    pohod: 'Pohod',
    clanarina: 'Clanarina',
    prijava: 'Prijava',
    komentar: 'Komentar',
    zahteve_za_vclanitev: 'Zahteve_Za_Vclanitev',
    ocena_drustva: 'Ocena_Drustva',
    fotografija: 'Fotografija',
    // Add additional tables if needed
};

// Ensure fixed export directory exists
if (!fs.existsSync(FIXED_EXPORT_DIR)) {
    fs.mkdirSync(FIXED_EXPORT_DIR);
}

// Process a single file
async function processFile(file) {
    const tableName = file.replace('.csv', '').toLowerCase();

    // Skip files that don't have a mapping
    if (!tableMapping[tableName]) {
        console.log(`⚠️ Skipping ${file} - No mapping found for ${tableName}`);
        return;
    }

    const inputPath = path.join(EXPORT_DIR, file);
    const outputPath = path.join(FIXED_EXPORT_DIR, file);

    console.log(`Processing ${file}...`);

    try {
        // Read and parse the CSV file with explicit delimiter and quote settings
        const fileContent = fs.readFileSync(inputPath, 'utf-8');
        const records = await new Promise((resolve, reject) => {
            parse(
                fileContent,
                {
                    columns: true,
                    skip_empty_lines: true,
                    delimiter: ',', // explicitly set delimiter
                    quote: '"', // explicitly set quote character
                    relax_column_count: true, // handle inconsistent column counts
                    trim: true, // trim whitespace
                    skip_records_with_error: true, // continue on minor errors
                },
                (err, records) => {
                    if (err) reject(err);
                    else resolve(records);
                }
            );
        });

        if (records.length === 0) {
            console.log(`⚠️ No data found in ${file}`);
            return;
        }

        // Get headers and convert to proper case
        const headers = Object.keys(records[0]).map((header) =>
            header.toLowerCase()
        );

        // Prepare the data for writing, ensuring each field is in its own column
        const rows = records.map((record) => {
            const row = {};
            headers.forEach((header) => {
                // Ensure we have a value for each column, even if empty
                row[header] = record[header] || '';
            });
            return row;
        });

        // Write the CSV file with proper column formatting
        const csvContent = stringify(rows, {
            header: true,
            columns: headers,
            delimiter: ',',
            quoted: true, // Always quote fields to handle special characters
            record_delimiter: 'windows', // Use CRLF for Windows compatibility
        });

        fs.writeFileSync(outputPath, csvContent, 'utf-8');
        console.log(`✅ Successfully fixed headers for ${file}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        throw error;
    }
}

// Process all CSV files
async function processCSVFiles() {
    try {
        // Get command line arguments
        const specificFile = process.argv[2];

        // Get all CSV files from export directory
        const files = fs
            .readdirSync(EXPORT_DIR)
            .filter((file) => file.endsWith('.csv'))
            .filter((file) => !specificFile || file === specificFile);

        console.log(`Found ${files.length} CSV file(s) to process.`);

        for (const file of files) {
            await processFile(file);
        }

        console.log('✅ CSV header fixing complete!');
        console.log(
            'Fixed CSV files have been saved to the ./db_export_fixed directory'
        );
        console.log('Next steps:');
        console.log(
            '1. Upload these fixed CSV files to Supabase via the Table Editor'
        );
        console.log(
            '2. Run the reset_sequences.sql script to reset the sequences'
        );
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

// Run the script
processCSVFiles();
