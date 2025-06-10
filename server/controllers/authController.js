const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { jwtSecret, jwtExpiry, cookieOptions } = require('../config/auth');
const db = require('../config/db');

async function login(req, res) {
    const uporabniskoIme = req.body?.uporabniskoIme || req.body?.username;
    const geslo = req.body?.geslo || req.body?.password;

    if (!uporabniskoIme || !geslo) {
        return res.status(400).json({
            error: 'Vnesite uporabniško ime in geslo',
        });
    }

    try {
        // Get user with password hash
        const user = await db('Uporabnik')
            .where('UporabniskoIme', uporabniskoIme)
            .first();

        if (!user) {
            return res
                .status(401)
                .json({ error: 'Napačno uporabniško ime ali geslo' });
        }

        // Compare password
        const isValid = await bcrypt.compare(geslo, user.Geslo);

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
        res.status(500).json({ error: 'Napaka pri prijavi' });
    }
}

async function register(req, res) {
    const { uporabniskoIme, geslo } = req.body;

    if (!uporabniskoIme || !geslo) {
        return res
            .status(400)
            .json({ error: 'Vnesite uporabniško ime in geslo' });
    }

    try {
        // Check if username exists
        const existingUser = await db('Uporabnik')
            .where('UporabniskoIme', uporabniskoIme)
            .first();

        if (existingUser) {
            return res
                .status(400)
                .json({ error: 'Uporabniško ime že obstaja' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(geslo, 10);

        // Insert user
        const [userId] = await db('Uporabnik').insert({
            UporabniskoIme: uporabniskoIme,
            Geslo: hashedPassword,
        });

        // Create token
        const token = jwt.sign(
            {
                id: userId,
                username: uporabniskoIme,
            },
            jwtSecret,
            { expiresIn: jwtExpiry }
        );

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
        res.status(500).json({ error: 'Napaka pri registraciji' });
    }
}

async function logout(req, res) {
    res.clearCookie('token');
    res.json({ success: true });
}

module.exports = { login, register, logout };
