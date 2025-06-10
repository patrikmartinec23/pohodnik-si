const express = require('express');
const router = express.Router();
const povezava = require('../config/db');

// Get all pohodi
router.get('/api/pohodi', async (req, res) => {
    const connection = await povezava();
    try {
        const [pohodi] = await connection.query('SELECT * FROM Pohod');
        res.json(pohodi);
    } catch (error) {
        console.error('Error fetching pohodi:', error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        await connection.end();
    }
});

// Route to get single pohod by ID
router.get('/api/pohodi/:id', async (req, res) => {
    const connection = await povezava();
    try {
        const [pohodi] = await connection.query(
            'SELECT * FROM Pohod WHERE IDPohod = ?',
            [req.params.id]
        );

        if (pohodi.length === 0) {
            return res.status(404).json({ error: 'Pohod not found' });
        }

        res.json(pohodi[0]);
    } catch (error) {
        console.error('Error fetching pohod:', error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        await connection.end();
    }
});

module.exports = router;
