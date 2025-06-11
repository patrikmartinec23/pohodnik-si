const express = require('express');
const router = express.Router();
const Pohod = require('../models/Pohod');

// Get all pohodi
router.get('/api/pohodi', async (req, res) => {
    try {
        const pohodi = await Pohod.getAll();
        res.json(pohodi);
    } catch (error) {
        console.error('Error fetching pohodi:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get filtered pohodi
router.get('/api/pohodi/filter', async (req, res) => {
    try {
        const filters = {
            search: req.query.search,
            difficulty: req.query.difficulty
                ? parseInt(req.query.difficulty)
                : null,
            location: req.query.location,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            availableOnly: req.query.availableOnly === 'true',
        };

        const pohodi = await Pohod.getFiltered(filters);
        res.json(pohodi);
    } catch (error) {
        console.error('Error fetching filtered pohodi:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single pohod by ID
router.get('/api/pohodi/:id', async (req, res) => {
    try {
        const pohod = await Pohod.getById(req.params.id);
        if (!pohod) {
            return res.status(404).json({ error: 'Pohod not found' });
        }
        res.json(pohod);
    } catch (error) {
        console.error('Error fetching pohod:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new pohod
router.post('/api/pohodi', async (req, res) => {
    try {
        const id = await Pohod.create(req.body);
        res.status(201).json({ id });
    } catch (error) {
        console.error('Error creating pohod:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update pohod
router.put('/api/pohodi/:id', async (req, res) => {
    try {
        await Pohod.update(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating pohod:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete pohod
router.delete('/api/pohodi/:id', async (req, res) => {
    try {
        await Pohod.delete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting pohod:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get comments for a pohod
router.get('/api/pohodi/:id/comments', async (req, res) => {
    try {
        const comments = await Pohod.getComments(req.params.id);
        res.json({ comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new comment
router.post('/api/pohodi/:id/comments', async (req, res) => {
    try {
        const id = await Pohod.addComment(
            req.params.id,
            req.body.userId,
            req.body.content,
            req.body.rating
        );
        res.status(201).json({ id });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
