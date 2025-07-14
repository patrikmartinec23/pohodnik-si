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
