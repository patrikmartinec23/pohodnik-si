const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// Get user profile
router.get('/api/users/:id', auth, async (req, res) => {
    try {
        const profile = await Profile.getUserProfile(req.params.id);
        if (!profile) {
            return res.status(404).json({ error: 'Profil ne obstaja' });
        }
        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Napaka pri nalaganju profila' });
    }
});

// Update user profile
router.put('/api/users/:id', auth, async (req, res) => {
    if (req.user.id !== parseInt(req.params.id)) {
        return res
            .status(403)
            .json({ error: 'Nimate dovoljenja za urejanje tega profila' });
    }

    try {
        await Profile.updateProfile(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Napaka pri posodabljanju profila' });
    }
});

// Get upcoming hikes for user
router.get('/api/users/:id/upcoming-hikes', auth, async (req, res) => {
    try {
        const hikes = await Profile.getUpcomingHikes(req.params.id);
        res.json(hikes);
    } catch (error) {
        console.error('Error fetching upcoming hikes:', error);
        res.status(500).json({
            error: 'Napaka pri nalaganju prihajajočih pohodov',
        });
    }
});

// Get user statistics
router.get('/api/users/:id/statistics', auth, async (req, res) => {
    try {
        const stats = await Profile.getUserStatistics(req.params.id);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        res.status(500).json({
            error: 'Napaka pri nalaganju statistike',
        });
    }
});

module.exports = router;
