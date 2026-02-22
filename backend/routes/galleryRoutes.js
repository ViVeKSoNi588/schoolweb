import express from 'express';
import Gallery from '../models/Gallery.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId, isCloudinaryUrl, getResponsiveUrls } from '../utils/cloudinary.js';

const router = express.Router();

// Get active gallery photos (public)
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

// Add gallery photo (URL) - Auto-detects Cloudinary URLs and generates optimized versions
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { src, title, category, description, year, order, isActive } = req.body;

        if (!src || !title || !category) {
            return res.status(400).json({ message: 'Source, title, and category are required' });
        }

        const photoData = {
            src,
            title,
            category,
            description: description || '',
            year: year || '2025-26',
            order: order || 0,
            isActive: isActive !== false,
            isUploaded: false
        };

        // Auto-detect Cloudinary URLs and generate optimized versions
        if (isCloudinaryUrl(src)) {
            const publicId = extractPublicId(src);
            if (publicId) {
                photoData.cloudinaryId = publicId;
                photoData.cloudinaryUrls = getResponsiveUrls(publicId);
                console.log(`✅ Auto-detected Cloudinary image: ${publicId}`);
            }
        }

        const photo = new Gallery(photoData);
        await photo.save();
        res.status(201).json(photo);
    } catch (error) {
        res.status(400).json({ message: 'Error adding gallery photo', error: error.message });
    }
});

// Upload gallery photo - uses Cloudinary CDN
router.post('/upload', authMiddleware, async (req, res) => {
    try {
        const { imageData, title, description, category, order, isActive, year } = req.body;

        if (!imageData || !imageData.startsWith('data:image/')) {
            return res.status(400).json({ message: 'Invalid image data. Must be base64 encoded image.' });
        }

        if (!title || !category) {
            return res.status(400).json({ message: 'Title and category are required' });
        }

        // Upload to Cloudinary with automatic optimization
        const cloudinaryFolder = `schoolweb/gallery/${category}`;
        const uploadResult = await uploadToCloudinary(imageData, cloudinaryFolder, {
            public_id: `${category}_${Date.now()}`,
            resource_type: 'image'
        });

        if (!uploadResult.success) {
            return res.status(500).json({ 
                message: 'Failed to upload image to Cloudinary', 
                error: uploadResult.error 
            });
        }

        // Store photo with Cloudinary URLs in MongoDB
        const photo = new Gallery({
            src: uploadResult.url, // Main Cloudinary URL
            title,
            category,
            description: description || '',
            year: year || '2025-26',
            order: order || 0,
            isActive: isActive !== false,
            isUploaded: true,
            cloudinaryId: uploadResult.publicId,
            cloudinaryUrls: {
                thumbnail: uploadResult.thumbnailUrl,
                medium: uploadResult.mediumUrl,
                large: uploadResult.largeUrl,
                blur: uploadResult.blurUrl,
                original: uploadResult.url
            },
            mimeType: `image/${uploadResult.format}`
        });

        await photo.save();

        res.status(201).json({
            message: 'Photo uploaded successfully',
            photo: {
                _id: photo._id,
                src: photo.src,
                title: photo.title,
                category: photo.category,
                description: photo.description,
                cloudinaryUrls: photo.cloudinaryUrls,
                isActive: photo.isActive,
                createdAt: photo.createdAt
            }
        });
    } catch (error) {
        console.error('Gallery upload error:', error);
        res.status(400).json({ message: 'Error uploading gallery photo', error: error.message });
    }
});

// Batch upload gallery photos - handles multiple photos at once
router.post('/batch-upload', authMiddleware, async (req, res) => {
    try {
        const { photos } = req.body; // Array of { imageData, title, description, category, year, order, isActive }

        if (!photos || !Array.isArray(photos) || photos.length === 0) {
            return res.status(400).json({ message: 'Invalid photos array. Must provide at least one photo.' });
        }

        if (photos.length > 20) {
            return res.status(400).json({ message: 'Maximum 20 photos allowed per batch upload.' });
        }

        const uploadResults = [];
        const errors = [];

        // Process each photo
        for (let i = 0; i < photos.length; i++) {
            const { imageData, title, description, category, year, order, isActive } = photos[i];

            try {
                if (!imageData || !imageData.startsWith('data:image/')) {
                    errors.push({ index: i, error: 'Invalid image data format' });
                    continue;
                }

                if (!title || !category) {
                    errors.push({ index: i, error: 'Title and category are required' });
                    continue;
                }

                // Upload to Cloudinary with automatic optimization
                const cloudinaryFolder = `schoolweb/gallery/${category}`;
                const uploadResult = await uploadToCloudinary(imageData, cloudinaryFolder, {
                    public_id: `${category}_${Date.now()}_${i}`,
                    resource_type: 'image'
                });

                if (!uploadResult.success) {
                    errors.push({ index: i, error: uploadResult.error });
                    continue;
                }

                // Store photo with Cloudinary URLs in MongoDB
                const photo = new Gallery({
                    src: uploadResult.url,
                    title: title.trim(),
                    category,
                    description: description || '',
                    year: year || '2025-26',
                    order: order || 0,
                    isActive: isActive !== false,
                    isUploaded: true,
                    cloudinaryId: uploadResult.publicId,
                    cloudinaryUrls: {
                        thumbnail: uploadResult.thumbnailUrl,
                        medium: uploadResult.mediumUrl,
                        large: uploadResult.largeUrl,
                        blur: uploadResult.blurUrl,
                        original: uploadResult.url
                    },
                    mimeType: `image/${uploadResult.format}`
                });

                await photo.save();
                uploadResults.push({
                    index: i,
                    success: true,
                    photo: {
                        _id: photo._id,
                        title: photo.title,
                        src: photo.src,
                        category: photo.category
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
            total: photos.length
        });
    } catch (error) {
        console.error('Error in batch upload:', error);
        res.status(500).json({ message: 'Error processing batch upload', error: error.message });
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

        // If it's a Cloudinary image, delete from Cloudinary
        if (photo.cloudinaryId) {
            const deleteResult = await deleteFromCloudinary(photo.cloudinaryId);
            if (!deleteResult.success) {
                console.warn('Failed to delete from Cloudinary:', deleteResult.error);
                // Continue with database deletion even if Cloudinary delete fails
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
