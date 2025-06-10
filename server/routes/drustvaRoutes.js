const express = require('express');
const router = express.Router();
const povezava = require('../config/db');

router.get('/api/drustva', async (req, res) => {
    const connection = await povezava();
    try {
        const [drustva] = await connection.query(
            'SELECT * FROM PohodniskoDrustvo ORDER BY DrustvoIme'
        );
        res.json(drustva);
    } catch (error) {
        console.error('Error fetching drustva:', error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        await connection.end();
    }
});

module.exports = router;
