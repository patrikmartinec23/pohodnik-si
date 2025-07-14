# Supabase Connection Test

After importing your data into Supabase, you should test that your backend can connect to the database correctly.

## Step 1: Verify Environment Variables

Ensure your `.env.production` file has the correct PostgreSQL connection details:

```
# Database Settings for PostgreSQL (Supabase)
DB_CLIENT=pg
DB_HOST=db.[your-project-ref].supabase.co
DB_USER=postgres
DB_PASSWORD=[your-supabase-database-password]
DB_NAME=postgres
DB_PORT=5432
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_KEY=[your-supabase-anon-key]
SUPABASE_SERVICE_KEY=[your-supabase-service-role-key]
```

## Step 2: Create a Test Connection Script

Create a file called `test-supabase-connection.js` with the following content:

```javascript
const knex = require('knex');
require('dotenv').config({ path: '.env.production' });

console.log('Testing PostgreSQL (Supabase) connection...');

// Log connection parameters (without sensitive information)
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`User: ${process.env.DB_USER}`);

const pg = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
    },
});

async function testConnection() {
    try {
        // Test basic connection
        await pg.raw('SELECT 1+1 AS result');
        console.log('✅ Basic connection successful!');

        // Test table counts
        console.log('\nCounting records in tables:');
        const tables = [
            'Uporabnik',
            'Pohodnik',
            'PohodniskoDrustvo',
            'Pohod',
            'Clanarina',
            'Prijava',
            'Komentar',
            'Zahteve_Za_Vclanitev',
            'Ocena_Drustva',
            'Fotografija',
        ];

        for (const table of tables) {
            try {
                const result = await pg(table).count('* as count').first();
                console.log(`${table}: ${result.count} records`);
            } catch (err) {
                console.error(`❌ Error counting ${table}: ${err.message}`);
            }
        }

        // Test a simple join query
        console.log('\nTesting a join query:');
        const pohodniki = await pg('Pohodnik')
            .join(
                'Uporabnik',
                'Pohodnik.TK_Uporabnik',
                '=',
                'Uporabnik.IDUporabnik'
            )
            .select(
                'Pohodnik.Ime',
                'Pohodnik.Priimek',
                'Uporabnik.UporabniskoIme'
            )
            .limit(5);

        console.log('Sample user data:');
        console.table(pohodniki);

        console.log('\n✅ All tests completed successfully!');
    } catch (error) {
        console.error(`\n❌ Connection test failed: ${error.message}`);
        if (error.code === '28P01') {
            console.error(
                'Authentication failed. Check your DB_USER and DB_PASSWORD.'
            );
        } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            console.error(
                'Could not reach the database host. Check your DB_HOST value.'
            );
        }
        console.error(error);
    } finally {
        await pg.destroy();
    }
}

testConnection();
```

## Step 3: Run the Test Script

```bash
node test-supabase-connection.js
```

If everything is configured correctly, you should see output showing successful connection and record counts from all your tables.

## Common Issues & Solutions

1. **SSL Error**: If you see SSL-related errors, make sure you're using the `ssl: { rejectUnauthorized: false }` option in your connection.

2. **Connection Refused**: Check that your IP address is allowed in Supabase. Go to your Supabase project settings > Database > Connection Pooling to configure allowed IP addresses.

3. **Auth Failed**: Verify your DB_USER and DB_PASSWORD. For Supabase, the default user is typically "postgres".

4. **Case Sensitivity Issues**: PostgreSQL treats table and column names as case-sensitive when they're quoted. Ensure your queries use the exact case as defined in your schema.

5. **Table Not Found**: Check that all tables were created successfully. Sometimes foreign key constraints can cause issues during table creation.
