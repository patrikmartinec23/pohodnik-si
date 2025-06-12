const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
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

router.delete('/api/pohodi/:id', auth, async (req, res) => {
    try {
        // First check if the pohod exists and get its owner
        const pohod = await Pohod.getById(req.params.id);
        if (!pohod) {
            return res.status(404).json({ error: 'Pohod not found' });
        }

        // Check if the user owns this pohod
        if (req.user.id !== pohod.DrustvoUserId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

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

router.post('/api/pohodi/:id/comments', auth, async (req, res) => {
    try {
        const id = await Pohod.addComment(
            req.params.id,
            req.body.userId,
            req.body.content
        );

        res.status(201).json({
            success: true,
            id,
            message: 'Comment added successfully',
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            error: 'Server error',
            details: error.message,
        });
    }
});

// Register for a hike
router.post('/api/pohodi/:id/prijava', auth, async (req, res) => {
    try {
        await Pohod.registerForHike(req.params.id, req.user.id);
        res.json({ message: 'Successfully registered for hike' });
    } catch (error) {
        console.error('Error registering for hike:', error);

        // Handle specific error types with consistent error messages
        if (error.message.includes('not a pohodnik')) {
            return res.status(400).json({ error: 'User is not a pohodnik' });
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: 'Pohod not found' });
        }
        if (error.message.includes('not a member')) {
            return res.status(403).json({
                error: 'Za prijavo na pohod morate biti član organizatorskega društva',
            });
        }
        if (error.message.includes('already registered')) {
            return res
                .status(400)
                .json({ error: 'Že ste prijavljeni na ta pohod' });
        }
        if (error.message.includes('No spots available')) {
            return res.status(400).json({ error: 'Ni več prostih mest' });
        }

        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/api/pohodi/:id/registration-status', auth, async (req, res) => {
    try {
        const isRegistered = await Pohod.checkUserRegistration(
            req.params.id,
            req.user.id
        );
        res.json({ isRegistered });
    } catch (error) {
        console.error('Error checking registration status:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Unregister from a hike
router.delete('/api/pohodi/:id/prijava', auth, async (req, res) => {
    try {
        await Pohod.unregisterFromHike(req.params.id, req.user.id);
        res.json({ message: 'Successfully unregistered from hike' });
    } catch (error) {
        console.error('Error unregistering from hike:', error);

        if (error.message.includes('not a pohodnik')) {
            return res.status(400).json({ error: 'User is not a pohodnik' });
        }
        if (error.message.includes('not registered')) {
            return res
                .status(400)
                .json({ error: 'Niste prijavljeni na ta pohod' });
        }

        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/api/pohodi/:id/registered', auth, async (req, res) => {
    try {
        // First check if the user owns this pohod
        const pohod = await Pohod.getById(req.params.id);
        if (!pohod) {
            return res.status(404).json({ error: 'Pohod not found' });
        }

        // Only allow drustvo owners to see registered users
        if (
            req.user.type !== 'drustvo' ||
            req.user.id !== pohod.DrustvoUserId
        ) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const registeredPohodniki = await Pohod.getRegisteredPohodniki(
            req.params.id
        );
        res.json({ registeredPohodniki });
    } catch (error) {
        console.error('Error fetching registered pohodniki:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
