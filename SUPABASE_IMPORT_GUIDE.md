# Supabase Import Guide

This guide will walk you through importing your data from CSV files into your Supabase PostgreSQL database.

## Prerequisites

-   Access to your Supabase project
-   Fixed CSV files in the `db_export_fixed` directory

## Step 1: Create the Database Schema

1. Open your Supabase project
2. Go to the "SQL Editor" section
3. Create a new query
4. Copy and paste the entire contents of `supabase-migration-updated.sql`
5. Run the query to create all the tables and relationships

## Step 2: Import CSV Data

For each table, follow these steps in order:

1. Start with tables that don't have foreign key dependencies (Uporabnik)
2. Go to the "Table Editor" in Supabase
3. Click on the table you want to import data into
4. Click "Import" button (usually near the top right)
5. Select the corresponding CSV file from `db_export_fixed` directory
6. Ensure "Header row" option is checked
7. Match the columns if necessary (should be automatic if headers match)
8. Click "Import" to load the data

### Import Order (to avoid foreign key constraint violations)

1. `Uporabnik.csv` - Import first
2. `Pohodnik.csv` - Depends on Uporabnik
3. `PohodniskoDrustvo.csv` - Depends on Uporabnik
4. `Pohod.csv` - Depends on PohodniskoDrustvo
5. `Clanarina.csv` - Depends on Pohodnik and PohodniskoDrustvo
6. `Prijava.csv` - Depends on Pohodnik and Pohod
7. `Komentar.csv` - Depends on Pohodnik and Pohod
8. `Zahteve_Za_Vclanitev.csv` - Depends on Pohodnik and PohodniskoDrustvo
9. `Ocena_Drustva.csv` - Depends on Pohodnik and PohodniskoDrustvo
10. `Fotografija.csv` - Depends on Pohod

## Step 3: Reset Auto-Increment Sequences

After importing all data, you need to reset the auto-increment sequences:

1. Go to the "SQL Editor" section in Supabase
2. Create a new query
3. Copy and paste the contents of `db_export_fixed/reset_sequences.sql`
4. Run the query to reset all sequences

## Step 4: Verify Data Import

For each table:

1. Go to the "Table Editor"
2. Click on the table name
3. Check that the data has been imported correctly
4. Verify the count of rows matches the expected number

## Troubleshooting

### Foreign Key Errors

If you get foreign key constraint errors, ensure you're importing in the correct order. You may need to temporarily disable foreign key constraints:

```sql
-- Disable foreign key checks before import
SET session_replication_role = 'replica';

-- After import, re-enable foreign key checks
SET session_replication_role = 'origin';
```

### Column Mismatch

If there are column mismatches, check that the CSV headers exactly match the column names in Supabase.

### Sequence Errors

If you get duplicate key errors after importing, the sequences might not be properly reset. Run the sequence reset SQL again.
