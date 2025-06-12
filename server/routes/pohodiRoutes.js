const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Pohod = require('../models/Pohod');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/images/pohodi');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Will be renamed after pohod is created with its ID
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'temp-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: fileFilter,
});

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
router.post(
    '/api/pohodi',
    auth,
    upload.single('pohodSlika'),
    async (req, res) => {
        try {
            const pohodData = req.body;

            const id = await Pohod.create(pohodData);

            // If there's an uploaded file, rename it to match the pohod ID
            if (req.file) {
                const oldPath = req.file.path;
                const fileExt = path.extname(req.file.originalname);
                const newFilename = `${id}${fileExt}`;
                const newPath = path.join(path.dirname(oldPath), newFilename);

                fs.renameSync(oldPath, newPath);

                // Update pohod with image path
                await Pohod.update(id, {
                    SlikanaslovnicaFilename: newFilename,
                });
            }

            res.status(201).json({ id });
        } catch (error) {
            console.error('Error creating pohod:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Update pohod with image
router.put(
    '/api/pohodi/:id',
    auth,
    upload.single('pohodSlika'),
    async (req, res) => {
        try {
            const pohodId = req.params.id;
            const pohodData = req.body;

            // If there's an uploaded file, process it
            if (req.file) {
                const uploadDir = path.join(
                    __dirname,
                    '../../public/images/pohodi'
                );
                const fileExt = path.extname(req.file.originalname);
                const newFilename = `${pohodId}${fileExt}`;
                const newPath = path.join(uploadDir, newFilename);

                // Remove old image if it exists (with any extension)
                const dir = fs.readdirSync(uploadDir);
                dir.forEach((file) => {
                    if (file.startsWith(pohodId + '.')) {
                        fs.unlinkSync(path.join(uploadDir, file));
                    }
                });

                // Rename uploaded file
                fs.renameSync(req.file.path, newPath);

                // Add filename to pohod data
                pohodData.SlikanaslovnicaFilename = newFilename;
            }

            await Pohod.update(pohodId, pohodData);
            res.json({ success: true });
        } catch (error) {
            console.error('Error updating pohod:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

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
