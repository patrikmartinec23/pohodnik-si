const express = require('express');
const povezava = require('./db');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.json());

// Serve static files from "public"
app.use(express.static(path.join(__dirname, 'public')));

// API: Get all pohodi
app.get('/api/pohodi', async (req, res) => {
    try {
        const connection = await povezava();
        const [rows] = await connection.query('SELECT * FROM Pohod');
        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error('Napaka:', err);
        res.status(500).json({ error: 'Napaka pri pridobivanju pohodov' });
    }
});

app.post('/api/registracija-pohodnik', async (req, res) => {
    const { uporabniskoIme, geslo, ime, priimek, datumRojstva, naslov } =
        req.body;

    if (
        !uporabniskoIme ||
        !geslo ||
        !ime ||
        !priimek ||
        !datumRojstva ||
        !naslov
    ) {
        return res
            .status(400)
            .json({ error: 'Manjkajo podatki za registracijo' });
    }

    const connection = await povezava();

    try {
        await connection.beginTransaction();

        const [rezultatUporabnik] = await connection.query(
            `INSERT INTO uporabnik (uporabniskoIme, geslo) VALUES (?, ?)`,
            [uporabniskoIme, geslo]
        );

        const TK_Uporabnik = rezultatUporabnik.insertId;

        await connection.query(
            `INSERT INTO pohodnik (ime, priimek, datumRojstva, prebivalisce, TK_Uporabnik)
       VALUES (?, ?, ?, ?, ?)`,
            [ime, priimek, datumRojstva, naslov, TK_Uporabnik]
        );

        await connection.commit();
        res.status(201).json({ success: true, id: TK_Uporabnik });
    } catch (err) {
        await connection.rollback();
        console.error('Napaka pri registraciji:', err);
        res.status(500).json({ error: 'Napaka pri registraciji uporabnika' });
    } finally {
        await connection.end();
    }
});

app.post('/api/registracija-drustvo', async (req, res) => {
    const {
        uporabniskoIme,
        geslo,
        drustvoIme,
        naslov,
        letoUstanovitve,
        predsednik,
    } = req.body;

    if (
        !uporabniskoIme ||
        !geslo ||
        !drustvoIme ||
        !naslov ||
        !letoUstanovitve ||
        !predsednik
    ) {
        return res
            .status(400)
            .json({ error: 'Manjkajo podatki za registracijo' });
    }

    const connection = await povezava();

    try {
        await connection.beginTransaction();

        const [rezultatUporabnik] = await connection.query(
            `INSERT INTO uporabnik (uporabniskoIme, geslo) VALUES (?, ?)`,
            [uporabniskoIme, geslo]
        );

        const TK_Uporabnik = rezultatUporabnik.insertId;

        await connection.query(
            `INSERT INTO PohodniskoDrustvo (drustvoIme, naslov, letoUstanovitve, predsednik, TK_Uporabnik)
       VALUES (?, ?, ?, ?, ?)`,
            [drustvoIme, naslov, letoUstanovitve, predsednik, TK_Uporabnik]
        );

        await connection.commit();
        res.status(201).json({ success: true, id: TK_Uporabnik });
    } catch (err) {
        await connection.rollback();
        console.error('Napaka pri registraciji:', err);
        res.status(500).json({ error: 'Napaka pri registraciji uporabnika' });
    } finally {
        await connection.end();
    }
});

app.use(express.static(path.join(__dirname, 'public/pages')));
app.use(bodyParser.json());

// Start server
app.listen(PORT, () => {
    console.log(
        `Strežnik ... V brskalnik vtipkajte naslov http://localhost:${PORT}`
    );
});

module.exports = { app, povezava };
