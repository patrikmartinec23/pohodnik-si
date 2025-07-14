const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/api/stats', async (req, res) => {
    try {
        const [[{ users }]] = await db.raw(
            'SELECT COUNT(*) AS users FROM Uporabnik'
        );
        const [[{ pohodi }]] = await db.raw(
            'SELECT COUNT(*) AS pohodi FROM Pohod'
        );
        const [[{ drustva }]] = await db.raw(
            'SELECT COUNT(*) AS drustva FROM PohodniskoDrustvo'
        );
        res.json({ users, pohodi, drustva });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Napaka pri pridobivanju statistike.' });
    }
});

module.exports = router;
