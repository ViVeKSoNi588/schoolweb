import express from 'express';
import Image from '../models/Image.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId, isCloudinaryUrl, getResponsiveUrls } from '../utils/cloudinary.js';

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

// Add image (URL) - Auto-detects Cloudinary URLs and generates optimized versions
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { src, alt, order, isActive, isUploaded, mimeType, category } = req.body;
        
        const imageData = {
            src,
            alt,
            order: order || 0,
            isActive: isActive !== false,
            isUploaded: isUploaded || false,
            mimeType: mimeType || null,
            category: category || 'home'
        };

        // Auto-detect Cloudinary URLs and generate optimized versions
        if (isCloudinaryUrl(src)) {
            const publicId = extractPublicId(src);
            if (publicId) {
                imageData.cloudinaryId = publicId;
                imageData.cloudinaryUrls = getResponsiveUrls(publicId);
                console.log(`✅ Auto-detected Cloudinary carousel image: ${publicId}`);
            }
        }

        const image = new Image(imageData);
        await image.save();
        res.status(201).json(image);
    } catch (error) {
        res.status(400).json({ message: 'Error adding image', error: error.message });
    }
});

// Upload image - uses Cloudinary CDN
router.post('/upload', authMiddleware, async (req, res) => {
    try {
        const { imageData, alt, order, isActive, category } = req.body;

        if (!imageData || !imageData.startsWith('data:image/')) {
            return res.status(400).json({ message: 'Invalid image data. Must be base64 encoded image.' });
        }

        // Upload to Cloudinary with automatic optimization
        const cloudinaryFolder = `schoolweb/carousel/${category || 'home'}`;
        const uploadResult = await uploadToCloudinary(imageData, cloudinaryFolder, {
            public_id: `carousel_${Date.now()}`,
            resource_type: 'image'
        });

        if (!uploadResult.success) {
            return res.status(500).json({ 
                message: 'Failed to upload image to Cloudinary', 
                error: uploadResult.error 
            });
        }

        // Store image with Cloudinary URLs in MongoDB
        const image = new Image({
            src: uploadResult.url, // Main Cloudinary URL
            alt: alt || 'Uploaded image',
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
            mimeType: `image/${uploadResult.format}`,
            category: category || 'home'
        });

        await image.save();

        res.status(201).json({
            message: 'Image uploaded successfully',
            image: {
                _id: image._id,
                src: image.src,
                alt: image.alt,
                order: image.order,
                isActive: image.isActive,
                isUploaded: image.isUploaded,
                cloudinaryUrls: image.cloudinaryUrls,
                category: image.category,
                createdAt: image.createdAt
            }
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(400).json({ message: 'Error uploading image', error: error.message });
    }
});

// Batch upload images - handles multiple images at once
router.post('/batch-upload', authMiddleware, async (req, res) => {
    try {
        const { images } = req.body; // Array of { imageData, alt, order, isActive, category }

        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ message: 'Invalid images array. Must provide at least one image.' });
        }

        if (images.length > 20) {
            return res.status(400).json({ message: 'Maximum 20 images allowed per batch upload.' });
        }

        const uploadResults = [];
        const errors = [];

        // Process each image
        for (let i = 0; i < images.length; i++) {
            const { imageData, alt, order, isActive, category } = images[i];

            try {
                if (!imageData || !imageData.startsWith('data:image/')) {
                    errors.push({ index: i, error: 'Invalid image data format' });
                    continue;
                }

                // Upload to Cloudinary with automatic optimization
                const cloudinaryFolder = `schoolweb/carousel/${category || 'home'}`;
                const uploadResult = await uploadToCloudinary(imageData, cloudinaryFolder, {
                    public_id: `carousel_${Date.now()}_${i}`,
                    resource_type: 'image'
                });

                if (!uploadResult.success) {
                    errors.push({ index: i, error: uploadResult.error });
                    continue;
                }

                // Store image with Cloudinary URLs in MongoDB
                const image = new Image({
                    src: uploadResult.url,
                    alt: alt || `Uploaded image ${i + 1}`,
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
                    mimeType: `image/${uploadResult.format}`,
                    category: category || 'home'
                });

                await image.save();
                uploadResults.push({
                    index: i,
                    success: true,
                    image: {
                        _id: image._id,
                        src: image.src,
                        alt: image.alt,
                        category: image.category
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
            total: images.length
        });
    } catch (error) {
        console.error('Error in batch upload:', error);
        res.status(500).json({ message: 'Error processing batch upload', error: error.message });
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

        // If it's a Cloudinary image, delete from Cloudinary
        if (image.cloudinaryId) {
            const deleteResult = await deleteFromCloudinary(image.cloudinaryId);
            if (!deleteResult.success) {
                console.warn('Failed to delete from Cloudinary:', deleteResult.error);
                // Continue with database deletion even if Cloudinary delete fails
            }
        }

        await Image.findByIdAndDelete(req.params.id);
        res.json({ message: 'Image deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting image', error: error.message });
    }
});

export default router;
