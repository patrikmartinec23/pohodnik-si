const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const MembershipRequest = require('../models/MembershipRequest');
const Pohod = require('../models/Pohod');
const DrustvoRating = require('../models/DrustvoRating');

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

// Get upcoming pohodi for drustvo
router.get('/api/drustvo/:drustvoId/pohodi/upcoming', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;

        const result = await Pohod.getUpcomingByDrustvoWithPagination(
            req.params.drustvoId,
            page,
            limit
        );

        res.json(result);
    } catch (error) {
        console.error('Error fetching upcoming drustvo pohodi:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get past pohodi for drustvo
router.get('/api/drustvo/:drustvoId/pohodi/past', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;

        const result = await Pohod.getPastByDrustvoWithPagination(
            req.params.drustvoId,
            page,
            limit
        );

        res.json(result);
    } catch (error) {
        console.error('Error fetching past drustvo pohodi:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/api/drustvo/:drustvoId/ratings', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const result = await DrustvoRating.getRatings(
            req.params.drustvoId,
            page,
            limit
        );
        res.json(result);
    } catch (error) {
        console.error('Error fetching drustvo ratings:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get drustvo average rating
router.get('/api/drustvo/:drustvoId/average-rating', async (req, res) => {
    try {
        const result = await DrustvoRating.getAverageRating(
            req.params.drustvoId
        );
        res.json(result);
    } catch (error) {
        console.error('Error fetching average rating:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add or update rating
router.post('/api/drustvo/:drustvoId/rating', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res
                .status(400)
                .json({ error: 'Rating must be between 1 and 5' });
        }

        // Check if user can rate
        const canRate = await DrustvoRating.checkCanRate(
            req.params.drustvoId,
            req.user.id
        );
        if (!canRate.canRate) {
            return res.status(403).json({ error: canRate.reason });
        }

        const id = await DrustvoRating.addRating(
            req.params.drustvoId,
            req.user.id,
            rating,
            comment
        );

        res.status(201).json({ success: true, id });
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's rating for a drustvo
router.get('/api/drustvo/:drustvoId/my-rating', auth, async (req, res) => {
    try {
        const rating = await DrustvoRating.getUserRating(
            req.params.drustvoId,
            req.user.id
        );
        res.json(rating || {});
    } catch (error) {
        console.error('Error fetching user rating:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Check if user can rate
router.get('/api/drustvo/:drustvoId/can-rate', auth, async (req, res) => {
    try {
        const result = await DrustvoRating.checkCanRate(
            req.params.drustvoId,
            req.user.id
        );
        res.json(result);
    } catch (error) {
        console.error('Error checking can rate:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
