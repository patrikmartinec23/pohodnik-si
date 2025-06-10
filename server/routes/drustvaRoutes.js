const express = require('express');
const router = express.Router();
const Drustvo = require('../models/Drustvo');

// Get all drustva
router.get('/api/drustva', async (req, res) => {
    try {
        const drustva = await Drustvo.getAll();
        res.json(drustva);
    } catch (error) {
        console.error('Error fetching drustva:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single drustvo
router.get('/api/drustva/:id', async (req, res) => {
    try {
        const drustvo = await Drustvo.getById(req.params.id);
        if (!drustvo) {
            return res.status(404).json({ error: 'Društvo not found' });
        }
        res.json(drustvo);
    } catch (error) {
        console.error('Error fetching drustvo:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new drustvo
router.post('/api/drustva', async (req, res) => {
    try {
        const id = await Drustvo.create(req.body);
        res.status(201).json({ id });
    } catch (error) {
        console.error('Error creating drustvo:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update drustvo
router.put('/api/drustva/:id', async (req, res) => {
    try {
        await Drustvo.update(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating drustvo:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete drustvo
router.delete('/api/drustva/:id', async (req, res) => {
    try {
        await Drustvo.delete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting drustvo:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
