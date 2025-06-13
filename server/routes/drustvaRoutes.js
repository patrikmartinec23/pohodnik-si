const express = require('express');
const router = express.Router();
const Drustvo = require('../models/Drustvo');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for banner image uploads
const bannerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/images/drustva');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const fileExt = path.extname(file.originalname);
        cb(null, `${req.params.id}${fileExt}`);
    },
});

const uploadBanner = multer({
    storage: bannerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
});

router.post(
    '/api/drustva/:id/banner',
    auth,
    uploadBanner.single('bannerImage'),
    async (req, res) => {
        try {
            console.log('Processing banner upload for ID:', req.params.id);

            // Check if file was uploaded
            if (!req.file) {
                console.error('No file was uploaded');
                return res.status(400).json({ error: 'No file was uploaded' });
            }

            console.log('File uploaded:', req.file);

            const drustvo = await Drustvo.getById(req.params.id);
            if (!drustvo) {
                return res.status(404).json({ error: 'Društvo not found' });
            }

            if (drustvo.TK_Uporabnik !== req.user.id) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            // Ensure the destination directory exists
            const uploadDir = path.join(
                __dirname,
                '../../public/images/drustva'
            );
            if (!fs.existsSync(uploadDir)) {
                console.log('Creating directory:', uploadDir);
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Define the final file path with timestamp to avoid caching
            const timestamp = Date.now();
            const fileExt = path.extname(req.file.originalname);
            const fileName = `${drustvo.IDPohodniskoDrustvo}${fileExt}`;
            const filePath = path.join(uploadDir, fileName);

            console.log('Source file path:', req.file.path);
            console.log('Destination file path:', filePath);

            // Delete existing images with the same ID but different extensions
            const files = fs.readdirSync(uploadDir);
            files.forEach((file) => {
                const fileId = parseInt(file.split('.')[0]);
                if (fileId === parseInt(drustvo.IDPohodniskoDrustvo)) {
                    const oldFilePath = path.join(uploadDir, file);
                    console.log('Deleting old file:', oldFilePath);
                    try {
                        fs.unlinkSync(oldFilePath);
                    } catch (err) {
                        console.error('Error deleting old file:', err);
                    }
                }
            });

            // Copy the uploaded file to the destination
            fs.copyFileSync(req.file.path, filePath);
            console.log('File copied successfully');

            // Delete the temporary file
            fs.unlinkSync(req.file.path);
            console.log('Temp file removed');

            // Create the image path for client response, using timestamp to bypass cache
            const imagePath = `/images/drustva/${fileName}?t=${timestamp}`;
            console.log('Response image path:', imagePath);

            res.json({ success: true, imagePath });
        } catch (error) {
            console.error('Error uploading banner:', error);
            res.status(500).json({ error: 'Server error: ' + error.message });
        }
    }
);

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
