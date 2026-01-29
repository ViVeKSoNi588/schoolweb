import express from 'express';
import Image from '../models/Image.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Get active carousel images (public)
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = { isActive: true };
        if (category) {
            if (category === 'home') {
                filter.$or = [
                    { category: 'home' },
                    { category: { $exists: false } },
                    { category: null },
                    { category: '' }
                ];
            } else {
                filter.category = category;
            }
        }
        const images = await Image.find(filter).sort({ order: 1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching images', error: error.message });
    }
});

// Get ALL images (admin)
router.get('/admin', authMiddleware, async (req, res) => {
    try {
        const images = await Image.find().sort({ order: 1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching images', error: error.message });
    }
});

// Add image (supports both URL and base64 upload) -> logic split? server.js had separate /upload endpoint
// server.js had POST /api/admin/images for URL and POST /api/admin/images/upload for base64
// I will keep them separate as per original structure but under this router.

// Add image (URL)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { src, alt, order, isActive, isUploaded, mimeType, category } = req.body;
        const image = new Image({
            src,
            alt,
            order: order || 0,
            isActive: isActive !== false,
            isUploaded: isUploaded || false,
            mimeType: mimeType || null,
            category: category || 'home'
        });
        await image.save();
        res.status(201).json(image);
    } catch (error) {
        res.status(400).json({ message: 'Error adding image', error: error.message });
    }
});

// Upload image - saves to disk
router.post('/upload', authMiddleware, async (req, res) => {
    try {
        const { imageData, alt, order, isActive, category } = req.body;

        if (!imageData || !imageData.startsWith('data:image/')) {
            return res.status(400).json({ message: 'Invalid image data. Must be base64 encoded image.' });
        }

        // Extract mime type and extension
        const mimeMatch = imageData.match(/^data:(image\/(\w+));base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const extension = mimeMatch ? mimeMatch[2] : 'jpg';
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');

        // Generate unique filename
        const filename = `img_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${extension}`;
        // Adjusted path: ../uploads from routes directory
        const filepath = join(__dirname, '../uploads', 'images', filename);

        // Ensure directory exists (server.js did this on startup, but robust to check here or rely on init)
        const imagesDir = join(__dirname, '../uploads', 'images');
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Save image file to disk
        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

        // Store only the URL reference in MongoDB
        const imageUrl = `/uploads/images/${filename}`;

        const image = new Image({
            src: imageUrl,
            alt: alt || 'Uploaded image',
            order: order || 0,
            isActive: isActive !== false,
            isUploaded: true,
            mimeType,
            filename,
            category: category || 'home'
        });
        await image.save();

        res.status(201).json({
            _id: image._id,
            src: image.src,
            alt: image.alt,
            order: image.order,
            isActive: image.isActive,
            isUploaded: image.isUploaded,
            mimeType: image.mimeType,
            category: image.category,
            createdAt: image.createdAt
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(400).json({ message: 'Error uploading image', error: error.message });
    }
});

// Update image
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const image = await Image.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(image);
    } catch (error) {
        res.status(400).json({ message: 'Error updating image', error: error.message });
    }
});

// Delete image
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // If it's an uploaded image, delete the file from disk
        if (image.isUploaded && image.filename) {
            const filepath = join(__dirname, '../uploads', 'images', image.filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }

        await Image.findByIdAndDelete(req.params.id);
        res.json({ message: 'Image deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting image', error: error.message });
    }
});

export default router;
