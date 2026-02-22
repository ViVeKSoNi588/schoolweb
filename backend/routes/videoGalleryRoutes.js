/* eslint-env node */
/* global Buffer */
import express from 'express';
import VideoGallery from '../models/VideoGallery.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { uploadVideoToCloudinary, deleteFromCloudinary, extractPublicId, isCloudinaryUrl, getResponsiveVideoUrls } from '../utils/cloudinary.js';
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
        const { category, year } = req.query;
        const filter = { isActive: true };
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (year && year !== 'all') {
            filter.year = year;
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

// Add video to gallery (YouTube URL or direct video URL) - Auto-detects Cloudinary URLs
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, src, type, thumbnail, category, order, isActive, year } = req.body;

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

        const videoData = {
            title: title.trim(),
            description: description || '',
            src: src.trim(),
            type: type || 'youtube',
            thumbnail: thumbnail || null,
            category: category,
            order: order || 0,
            isActive: isActive !== false,
            year: year || '2025-26'
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

        const video = new VideoGallery(videoData);
        await video.save();
        res.status(201).json(video);
    } catch (error) {
        console.error('Error adding video to gallery:', error);
        res.status(400).json({ message: 'Error adding video to gallery', error: error.message });
    }
});

// Upload video to gallery as base64 - uses Cloudinary CDN
router.post('/upload', authMiddleware, async (req, res) => {
    try {
        const { videoData, title, description, thumbnail, category, order, isActive, year } = req.body;

        if (!videoData || !videoData.startsWith('data:video/')) {
            return res.status(400).json({ message: 'Invalid video data. Must be base64 encoded video.' });
        }

        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        // Upload to Cloudinary with automatic optimization
        const cloudinaryFolder = `schoolweb/videos/gallery/${category}`;
        const uploadResult = await uploadVideoToCloudinary(videoData, cloudinaryFolder, {
            public_id: `${category}_${Date.now()}`,
            resource_type: 'video'
        });

        if (!uploadResult.success) {
            return res.status(500).json({ 
                message: 'Failed to upload video to Cloudinary', 
                error: uploadResult.error 
            });
        }

        // Store video with Cloudinary URLs in MongoDB
        const video = new VideoGallery({
            title: title || 'Uploaded video',
            description,
            src: uploadResult.url,  // Cloudinary URL
            type: 'uploaded',
            thumbnail: thumbnail || uploadResult.thumbnailUrl,  // Use Cloudinary thumbnail if not provided
            category: category,
            order: order || 0,
            isActive: isActive !== false,
            year: year || '2025-26',
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
        console.error('Error uploading video to gallery:', error);
        res.status(400).json({ message: 'Error uploading video to gallery', error: error.message });
    }
});

// Batch upload videos to gallery - handles multiple videos at once
router.post('/batch-upload', authMiddleware, async (req, res) => {
    try {
        const { videos } = req.body; // Array of { videoData, title, description, thumbnail, category, year, order, isActive }

        if (!videos || !Array.isArray(videos) || videos.length === 0) {
            return res.status(400).json({ message: 'Invalid videos array. Must provide at least one video.' });
        }

        if (videos.length > 10) {
            return res.status(400).json({ message: 'Maximum 10 videos allowed per batch upload.' });
        }

        const uploadResults = [];
        const errors = [];

        // Process each video
        for (let i = 0; i < videos.length; i++) {
            const { videoData, title, description, thumbnail, category, year, order, isActive } = videos[i];

            try {
                if (!videoData || !videoData.startsWith('data:video/')) {
                    errors.push({ index: i, error: 'Invalid video data format' });
                    continue;
                }

                if (!category) {
                    errors.push({ index: i, error: 'Category is required' });
                    continue;
                }

                // Upload to Cloudinary with automatic optimization
                const cloudinaryFolder = `schoolweb/videos/gallery/${category}`;
                const uploadResult = await uploadVideoToCloudinary(videoData, cloudinaryFolder, {
                    public_id: `${category}_${Date.now()}_${i}`,
                    resource_type: 'video'
                });

                if (!uploadResult.success) {
                    errors.push({ index: i, error: uploadResult.error });
                    continue;
                }

                // Store video with Cloudinary URLs in MongoDB
                const video = new VideoGallery({
                    title: title || `Uploaded video ${i + 1}`,
                    description: description || '',
                    src: uploadResult.url,
                    type: 'uploaded',
                    thumbnail: thumbnail || uploadResult.thumbnailUrl,
                    category: category,
                    order: order || 0,
                    isActive: isActive !== false,
                    year: year || '2025-26',
                    cloudinaryId: uploadResult.publicId,
                    cloudinaryUrls: {
                        thumbnail: uploadResult.thumbnailUrl,
                        sd: uploadResult.sdUrl,
                        hd: uploadResult.hdUrl,
                        original: uploadResult.url
                    }
                });

                await video.save();
                uploadResults.push({
                    index: i,
                    success: true,
                    video: {
                        _id: video._id,
                        title: video.title,
                        src: video.src,
                        category: video.category
                    }
                });
            } catch (error) {
                errors.push({ index: i, error: error.message });
            }
        }

        res.status(201).json({
            message: `Batch upload completed: ${uploadResults.length} successful, ${errors.length} failed`,
            successful: uploadResults,
            failed: errors,
            total: videos.length
        });
    } catch (error) {
        console.error('Error in batch upload:', error);
        res.status(500).json({ message: 'Error processing batch upload', error: error.message });
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
