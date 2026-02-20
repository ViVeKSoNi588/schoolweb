/* eslint-env node */
/* global Buffer */
import express from 'express';
import VideoGallery from '../models/VideoGallery.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Get active gallery videos (public)
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = { isActive: true };
        if (category && category !== 'all') {
            filter.category = category;
        }
        const videos = await VideoGallery.find(filter).sort({ order: 1, createdAt: -1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching video gallery', error: error.message });
    }
});

// Get video gallery categories with counts (public)
router.get('/categories', async (req, res) => {
    try {
        const categories = await VideoGallery.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

// Get ALL video gallery items (admin)
router.get('/admin', authMiddleware, async (req, res) => {
    try {
        const videos = await VideoGallery.find().sort({ order: 1, createdAt: -1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching video gallery', error: error.message });
    }
});

// Add video to gallery (YouTube URL or direct video URL)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, src, type, thumbnail, category, order, isActive } = req.body;

        // Validate required fields
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }
        if (!src || !src.trim()) {
            return res.status(400).json({ message: 'Video source URL is required' });
        }
        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        const video = new VideoGallery({
            title: title.trim(),
            description: description || '',
            src: src.trim(),
            type: type || 'youtube',
            thumbnail: thumbnail || null,
            category: category,
            order: order || 0,
            isActive: isActive !== false
        });
        await video.save();
        res.status(201).json(video);
    } catch (error) {
        console.error('Error adding video to gallery:', error);
        res.status(400).json({ message: 'Error adding video to gallery', error: error.message });
    }
});

// Upload video to gallery as base64 - SAVES TO DISK
router.post('/upload', authMiddleware, async (req, res) => {
    try {
        const { videoData, title, description, thumbnail, category, order, isActive } = req.body;

        if (!videoData || !videoData.startsWith('data:video/')) {
            return res.status(400).json({ message: 'Invalid video data. Must be base64 encoded video.' });
        }

        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        // Extract mime type and base64 data
        const mimeMatch = videoData.match(/^data:(video\/(\w+));base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'video/mp4';
        const extension = mimeMatch ? mimeMatch[2] : 'mp4';
        const base64Data = videoData.replace(/^data:video\/\w+;base64,/, '');

        // Generate unique filename
        const filename = `videogallery_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${extension}`;
        const filepath = join(__dirname, '../uploads', 'videos', filename);

        // Ensure directory exists
        const videosDir = join(__dirname, '../uploads', 'videos');
        if (!fs.existsSync(videosDir)) {
            fs.mkdirSync(videosDir, { recursive: true });
        }

        // Save video file to disk
        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

        // Store only the URL reference in MongoDB (not the video data)
        const videoUrl = `/uploads/videos/${filename}`;

        const video = new VideoGallery({
            title: title || 'Uploaded video',
            description,
            src: videoUrl,  // Store URL, not base64
            type: 'uploaded',
            thumbnail,
            category: category,
            order: order || 0,
            isActive: isActive !== false,
            mimeType,
            filename  // Store filename for deletion
        });
        await video.save();

        // Return video without large data
        res.status(201).json({
            _id: video._id,
            title: video.title,
            description: video.description,
            src: video.src,
            type: video.type,
            thumbnail: video.thumbnail,
            category: video.category,
            order: video.order,
            isActive: video.isActive,
            createdAt: video.createdAt
        });
    } catch (error) {
        console.error('Error uploading video to gallery:', error);
        res.status(400).json({ message: 'Error uploading video to gallery', error: error.message });
    }
});

// Update video in gallery
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, description, category, order, isActive } = req.body;
        const video = await VideoGallery.findByIdAndUpdate(
            req.params.id,
            { title, description, category, order, isActive },
            { new: true }
        );
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.json(video);
    } catch (error) {
        res.status(400).json({ message: 'Error updating video', error: error.message });
    }
});

// Delete video from gallery
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const video = await VideoGallery.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // If it's an uploaded video, delete the file from disk
        if (video.type === 'uploaded' && video.filename) {
            const filepath = join(__dirname, '../uploads', 'videos', video.filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }

        await VideoGallery.findByIdAndDelete(req.params.id);
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting video', error: error.message });
    }
});

// Reorder videos
router.put('/reorder', authMiddleware, async (req, res) => {
    try {
        const { items } = req.body; // Array of { id, order }
        
        const updatePromises = items.map(item => 
            VideoGallery.findByIdAndUpdate(item.id, { order: item.order })
        );
        
        await Promise.all(updatePromises);
        res.json({ message: 'Videos reordered successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error reordering videos', error: error.message });
    }
});

export default router;
