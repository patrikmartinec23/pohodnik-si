const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { jwtSecret, jwtExpiry, cookieOptions } = require('../config/auth');
const povezava = require('../config/db');

async function login(req, res) {
    console.log('=== LOGIN DEBUG ===');

    // Handle both JSON body and form-urlencoded
    const uporabniskoIme =
        req.body?.uporabniskoIme ||
        req.body?.username ||
        req.headers?.uporabniskoime;
    const geslo = req.body?.geslo || req.body?.password || req.headers?.geslo;

    console.log('Login attempt with:', {
        uporabniskoIme,
        passwordProvided: !!geslo,
    });

    if (!uporabniskoIme || !geslo) {
        return res.status(400).json({
            error: 'Vnesite uporabniško ime in geslo',
            debug: {
                contentType: req.headers['content-type'],
                hasBody: !!req.body,
                bodyKeys: req.body ? Object.keys(req.body) : [],
            },
        });
    }

    const connection = await povezava();
    try {
        // Get user with password hash
        const [users] = await connection.query(
            'SELECT IDUporabnik, UporabniskoIme, Geslo FROM Uporabnik WHERE UporabniskoIme = ?',
            [uporabniskoIme]
        );

        console.log('Found users:', users.length);

        if (users.length === 0) {
            return res
                .status(401)
                .json({ error: 'Napačno uporabniško ime ali geslo' });
        }

        const user = users[0];
        console.log('User found:', {
            id: user.IDUporabnik,
            username: user.UporabniskoIme,
            passwordHash: user.Geslo.substring(0, 10) + '...', // Show only part of hash for security
        });

        // Compare password
        const isValid = await bcrypt.compare(geslo, user.Geslo);
        console.log('Password validation:', {
            providedPassword: geslo.substring(0, 3) + '...',
            isValid: isValid,
        });

        if (!isValid) {
            return res
                .status(401)
                .json({ error: 'Napačno uporabniško ime ali geslo' });
        }

        // Create token
        const token = jwt.sign(
            {
                id: user.IDUporabnik,
                username: user.UporabniskoIme,
            },
            jwtSecret,
            { expiresIn: jwtExpiry }
        );

        // Set cookie and send response
        res.cookie('token', token, cookieOptions);
        res.json({
            success: true,
            user: {
                id: user.IDUporabnik,
                username: user.UporabniskoIme,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            error: 'Napaka pri prijavi',
            debug: err.message,
        });
    } finally {
        await connection.end();
    }
}

async function register(req, res) {
    console.log('Registration attempt:', req.body);

    const { uporabniskoIme, geslo, tip } = req.body;

    if (!uporabniskoIme || !geslo) {
        return res.status(400).json({
            error: 'Vnesite uporabniško ime in geslo',
        });
    }

    const connection = await povezava();

    try {
        // Check if username already exists
        const [existing] = await connection.query(
            'SELECT * FROM Uporabnik WHERE UporabniskoIme = ?',
            [uporabniskoIme]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                error: 'Uporabniško ime že obstaja',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(geslo, 10);

        // Insert new user
        const [result] = await connection.query(
            'INSERT INTO Uporabnik (UporabniskoIme, Geslo) VALUES (?, ?)',
            [uporabniskoIme, hashedPassword]
        );

        const userId = result.insertId;

        // Create JWT token
        const token = jwt.sign(
            { id: userId, username: uporabniskoIme },
            jwtSecret,
            { expiresIn: jwtExpiry }
        );

        // Set cookie and send response
        res.cookie('token', token, cookieOptions);
        res.json({
            success: true,
            user: {
                id: userId,
                username: uporabniskoIme,
            },
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            error: 'Napaka pri registraciji',
        });
    } finally {
        await connection.end();
    }
}

async function logout(req, res) {
    res.clearCookie('token');
    res.json({ success: true });
}

module.exports = { login, register, logout };
