const bcrypt = require('bcryptjs');
const povezava = require('./server/config/db');

async function createUser(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await povezava();

    try {
        await connection.query(
            'INSERT INTO Uporabnik (UporabniskoIme, Geslo) VALUES (?, ?)',
            [username, hashedPassword]
        );
        console.log('User created successfully');
    } catch (err) {
        console.error('Error creating user:', err);
    } finally {
        await connection.end();
    }
}

// Create test user
createUser('testuser', 'testpass123');
