const bcrypt = require('bcryptjs');
const povezava = require('./server/config/db');

const TEST_USER = {
    username: 'testuser',
    password: 'testpass123',
};

async function testAuth() {
    const connection = await povezava();

    try {
        // Step 1: Reset user
        console.log('1. Resetting test user...');
        await connection.query(
            'DELETE FROM Uporabnik WHERE UporabniskoIme = ?',
            [TEST_USER.username]
        );

        // Step 2: Create new user
        console.log('2. Creating test user...');
        const hash = await bcrypt.hash(TEST_USER.password, 10);
        const [result] = await connection.query(
            'INSERT INTO Uporabnik (UporabniskoIme, Geslo) VALUES (?, ?)',
            [TEST_USER.username, hash]
        );

        // Step 3: Verify user creation
        console.log('3. Verifying user creation...');
        const [users] = await connection.query(
            'SELECT * FROM Uporabnik WHERE IDUporabnik = ?',
            [result.insertId]
        );

        if (users.length === 0) {
            throw new Error('User was not created!');
        }

        // Step 4: Test password verification
        console.log('4. Testing password verification...');
        const isValid = await bcrypt.compare(
            TEST_USER.password,
            users[0].Geslo
        );

        console.log('\nTest Results:');
        console.log('-------------');
        console.log('User ID:', users[0].IDUporabnik);
        console.log('Username:', users[0].UporabniskoIme);
        console.log('Hash Length:', users[0].Geslo.length);
        console.log('Password Valid:', isValid);

        if (!isValid) {
            throw new Error('Password verification failed!');
        }

        console.log('\nAll tests passed! ✅');
        console.log('\nUse these credentials in Postman:');
        console.log('--------------------------------');
        console.log(
            JSON.stringify(
                {
                    uporabniskoIme: TEST_USER.username,
                    geslo: TEST_USER.password,
                },
                null,
                2
            )
        );
    } catch (err) {
        console.error('\n❌ Test failed:', err.message);
    } finally {
        await connection.end();
    }
}

testAuth().catch(console.error);
