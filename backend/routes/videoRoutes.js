import express from 'express';
import Video from '../models/Video.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { uploadVideoToCloudinary, deleteFromCloudinary, extractPublicId, isCloudinaryUrl, getResponsiveVideoUrls } from '../utils/cloudinary.js';
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

// Add video (YouTube URL or direct video URL) - Auto-detects Cloudinary URLs
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

        const videoData = {
            title: title.trim(),
            description: description || '',
            src: src.trim(),
            type: type || 'youtube',
            thumbnail: thumbnail || null,
            order: order || 0,
            isActive: isActive !== false
        };

        // Auto-detect Cloudinary video URLs and generate optimized versions
        if (isCloudinaryUrl(src)) {
            const publicId = extractPublicId(src);
            if (publicId) {
                videoData.cloudinaryId = publicId;
                videoData.cloudinaryUrls = getResponsiveVideoUrls(publicId);
                // Use the thumbnail from Cloudinary if not provided
                if (!thumbnail) {
                    videoData.thumbnail = videoData.cloudinaryUrls.thumbnail;
                }
                console.log(`✅ Auto-detected Cloudinary video: ${publicId}`);
            }
        }

        const video = new Video(videoData);
        await video.save();
        res.status(201).json(video);
    } catch (error) {
        console.error('Error adding video:', error);
        res.status(400).json({ message: 'Error adding video', error: error.message });
    }
});

// Upload video as base64 - uses Cloudinary CDN
router.post('/upload', authMiddleware, async (req, res) => {
    try {
        const { videoData, title, description, thumbnail, order, isActive } = req.body;

        if (!videoData || !videoData.startsWith('data:video/')) {
            return res.status(400).json({ message: 'Invalid video data. Must be base64 encoded video.' });
        }

        // Upload to Cloudinary with automatic optimization
        const cloudinaryFolder = 'schoolweb/videos/carousel';
        const uploadResult = await uploadVideoToCloudinary(videoData, cloudinaryFolder, {
            public_id: `carousel_${Date.now()}`,
            resource_type: 'video'
        });

        if (!uploadResult.success) {
            return res.status(500).json({ 
                message: 'Failed to upload video to Cloudinary', 
                error: uploadResult.error 
            });
        }

        // Store video with Cloudinary URLs in MongoDB
        const video = new Video({
            title: title || 'Uploaded video',
            description,
            src: uploadResult.url,  // Cloudinary URL
            type: 'uploaded',
            thumbnail: thumbnail || uploadResult.thumbnailUrl,  // Use Cloudinary thumbnail if not provided
            order: order || 0,
            isActive: isActive !== false,
            cloudinaryId: uploadResult.publicId,
            cloudinaryUrls: {
                thumbnail: uploadResult.thumbnailUrl,
                sd: uploadResult.sdUrl,
                hd: uploadResult.hdUrl,
                original: uploadResult.url
            }
        });
        await video.save();

        res.status(201).json(video);
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

        // If it's a Cloudinary video, delete from Cloudinary
        if (video.cloudinaryId) {
            await deleteFromCloudinary(video.cloudinaryId);
        }
        // Legacy: If it's an uploaded video on disk, delete the file
        else if (video.type === 'uploaded' && video.filename) {
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
