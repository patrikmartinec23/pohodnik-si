require('dotenv').config(); // Simply load .env from the current directory
const bcrypt = require('bcrypt');
const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
    },
});

async function hashPasswords() {
    try {
        console.log('Starting password hashing process...');
        console.log('Database connection info:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
        });

        // Get all users
        const users = await knex('Uporabnik').select('*');
        console.log(`Found ${users.length} users in the database.`);

        let updatedCount = 0;

        // Process each user
        for (const user of users) {
            // Check if the password might be unhashed (assuming hashed passwords are longer)
            if (user.Geslo.length < 20) {
                console.log(
                    `Hashing password for user: ${user.UporabniskoIme}`
                );

                // Hash the password
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(
                    user.Geslo,
                    saltRounds
                );

                // Update the user record with the hashed password
                await knex('Uporabnik')
                    .where('IDUporabnik', user.IDUporabnik)
                    .update({ Geslo: hashedPassword });

                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} user passwords.`);
        console.log('Password hashing completed.');
    } catch (error) {
        console.error('Error hashing passwords:', error);
    } finally {
        // Close the database connection
        await knex.destroy();
    }
}

// Run the script
hashPasswords()
    .then(() => {
        console.log('Script execution complete.');
    })
    .catch((err) => {
        console.error('Script execution failed:', err);
        process.exit(1);
    });
