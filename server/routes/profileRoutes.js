const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const MembershipRequest = require('../models/MembershipRequest');
const Pohod = require('../models/Pohod');

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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;

        const hikes = await Profile.getUpcomingHikes(
            req.params.id,
            page,
            limit
        );
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

router.get('/api/drustvo/:userId', async (req, res) => {
    try {
        const drustvo = await Profile.getDrustvoProfile(req.params.userId);

        if (!drustvo) {
            return res.status(404).json({ error: 'Društvo not found' });
        }

        res.json(drustvo);
    } catch (error) {
        console.error('Error fetching društvo profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get(
    '/api/drustvo/:drustvoId/membership-requests',
    auth,
    async (req, res) => {
        try {
            const requests = await MembershipRequest.getRequestsForDrustvo(
                req.params.drustvoId
            );
            res.json(requests);
        } catch (error) {
            console.error('Error fetching membership requests:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

router.post(
    '/api/drustvo/:drustvoId/request-membership',
    auth,
    async (req, res) => {
        try {
            await MembershipRequest.create(req.params.drustvoId, req.user.id);
            res.status(201).json({ message: 'Request submitted successfully' });
        } catch (error) {
            console.error('Error submitting membership request:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

router.post(
    '/api/membership-requests/:requestId/:action',
    auth,
    async (req, res) => {
        try {
            const { requestId, action } = req.params;
            if (!['accept', 'reject'].includes(action)) {
                return res.status(400).json({ error: 'Invalid action' });
            }

            await MembershipRequest.handleRequest(requestId, action);
            res.json({ message: 'Request handled successfully' });
        } catch (error) {
            console.error('Error handling membership request:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Check membership status
router.get(
    '/api/drustvo/:drustvoId/membership-status',
    auth,
    async (req, res) => {
        try {
            const status = await MembershipRequest.checkMembershipStatus(
                req.params.drustvoId,
                req.user.id
            );
            res.json(status);
        } catch (error) {
            console.error('Error checking membership status:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Leave membership
router.post(
    '/api/drustvo/:drustvoId/leave-membership',
    auth,
    async (req, res) => {
        try {
            await MembershipRequest.leaveMembership(
                req.params.drustvoId,
                req.user.id
            );
            res.json({ message: 'Successfully left membership' });
        } catch (error) {
            console.error('Error leaving membership:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

router.get('/api/drustvo/:drustvoId/pohodi', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;

        const result = await Pohod.getByDrustvoWithPagination(
            req.params.drustvoId,
            page,
            limit
        );

        res.json(result);
    } catch (error) {
        console.error('Error fetching drustvo pohodi:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
