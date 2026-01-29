import express from 'express';
import Video from '../models/Video.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Get active videos (public)
router.get('/', async (req, res) => {
    try {
        const videos = await Video.find({ isActive: true }).sort({ order: 1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching videos', error: error.message });
    }
});

// Get ALL videos (admin)
router.get('/admin', authMiddleware, async (req, res) => {
    try {
        const videos = await Video.find().sort({ order: 1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching videos', error: error.message });
    }
});

// Add video (YouTube URL or direct video URL)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, src, type, thumbnail, order, isActive } = req.body;

        // Validate required fields
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }
        if (!src || !src.trim()) {
            return res.status(400).json({ message: 'Video source URL is required' });
        }

        const video = new Video({
            title: title.trim(),
            description: description || '',
            src: src.trim(),
            type: type || 'youtube',
            thumbnail: thumbnail || null,
            order: order || 0,
            isActive: isActive !== false
        });
        await video.save();
        res.status(201).json(video);
    } catch (error) {
        console.error('Error adding video:', error);
        res.status(400).json({ message: 'Error adding video', error: error.message });
    }
});

// Upload video as base64 - SAVES TO DISK
router.post('/upload', authMiddleware, async (req, res) => {
    try {
        const { videoData, title, description, thumbnail, order, isActive } = req.body;

        if (!videoData || !videoData.startsWith('data:video/')) {
            return res.status(400).json({ message: 'Invalid video data. Must be base64 encoded video.' });
        }

        // Extract mime type and base64 data
        const mimeMatch = videoData.match(/^data:(video\/(\w+));base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'video/mp4';
        const extension = mimeMatch ? mimeMatch[2] : 'mp4';
        const base64Data = videoData.replace(/^data:video\/\w+;base64,/, '');

        // Generate unique filename
        const filename = `video_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${extension}`;
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

        const video = new Video({
            title: title || 'Uploaded video',
            description,
            src: videoUrl,  // Store URL, not base64
            type: 'uploaded',
            thumbnail,
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
            order: video.order,
            isActive: video.isActive,
            mimeType: video.mimeType,
            createdAt: video.createdAt
        });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(400).json({ message: 'Error uploading video', error: error.message });
    }
});

// Update video
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(video);
    } catch (error) {
        res.status(400).json({ message: 'Error updating video', error: error.message });
    }
});

// Delete video
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
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

        await Video.findByIdAndDelete(req.params.id);
        res.json({ message: 'Video deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting video', error: error.message });
    }
});

export default router;
