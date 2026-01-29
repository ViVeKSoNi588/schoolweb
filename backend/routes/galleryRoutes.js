import express from 'express';
import Gallery from '../models/Gallery.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Get active gallery photos (public)
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = { isActive: true };
        if (category && category !== 'all') {
            filter.category = category;
        }
        const photos = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gallery photos', error: error.message });
    }
});

// Get gallery categories with photo counts (public)
router.get('/categories', async (req, res) => {
    try {
        const categories = await Gallery.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

// Get ALL gallery photos (admin)
router.get('/admin', authMiddleware, async (req, res) => {
    try {
        const photos = await Gallery.find().sort({ order: 1, createdAt: -1 });
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gallery photos', error: error.message });
    }
});

// Add gallery photo (URL)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { src, title, category, description, order, isActive } = req.body;

        if (!src || !title || !category) {
            return res.status(400).json({ message: 'Source, title, and category are required' });
        }

        const photo = new Gallery({
            src,
            title,
            category,
            description: description || '',
            order: order || 0,
            isActive: isActive !== false,
            isUploaded: false
        });
        await photo.save();
        res.status(201).json(photo);
    } catch (error) {
        res.status(400).json({ message: 'Error adding gallery photo', error: error.message });
    }
});

// Upload gallery photo - saves to disk
router.post('/upload', authMiddleware, async (req, res) => {
    try {
        const { imageData, title, category, description, order, isActive } = req.body;

        if (!imageData || !imageData.startsWith('data:image/')) {
            return res.status(400).json({ message: 'Invalid image data. Must be base64 encoded image.' });
        }

        if (!title || !category) {
            return res.status(400).json({ message: 'Title and category are required' });
        }

        // Extract mime type and extension
        const mimeMatch = imageData.match(/^data:(image\/(\w+));base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const extension = mimeMatch ? mimeMatch[2] : 'jpg';
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');

        // Generate unique filename
        const filename = `gallery_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${extension}`;
        const filepath = join(__dirname, '../uploads', 'images', filename);

        // Ensure directory exists
        const imagesDir = join(__dirname, '../uploads', 'images');
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Save image file to disk
        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

        // Store only the URL reference in MongoDB
        const imageUrl = `/uploads/images/${filename}`;

        const photo = new Gallery({
            src: imageUrl,
            title,
            category,
            description: description || '',
            order: order || 0,
            isActive: isActive !== false,
            isUploaded: true,
            mimeType,
            filename
        });
        await photo.save();
        res.status(201).json(photo);
    } catch (error) {
        console.error('Error uploading gallery photo:', error);
        res.status(400).json({ message: 'Error uploading gallery photo', error: error.message });
    }
});

// Update gallery photo
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const photo = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }
        res.json(photo);
    } catch (error) {
        res.status(400).json({ message: 'Error updating gallery photo', error: error.message });
    }
});

// Delete gallery photo
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const photo = await Gallery.findById(req.params.id);
        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        // If it's an uploaded image, delete the file from disk
        if (photo.isUploaded && photo.filename) {
            const filepath = join(__dirname, '../uploads', 'images', photo.filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }

        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ message: 'Gallery photo deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting gallery photo', error: error.message });
    }
});

// Bulk delete gallery photos
router.post('/bulk-delete', authMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Photo IDs are required' });
        }
        const result = await Gallery.deleteMany({ _id: { $in: ids } });
        res.json({ message: `${result.deletedCount} photos deleted` });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting gallery photos', error: error.message });
    }
});

export default router;
