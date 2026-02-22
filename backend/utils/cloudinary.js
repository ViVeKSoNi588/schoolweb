/* eslint-env node */
/* global process */
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary with automatic optimization
 * @param {string} base64Image - Base64 encoded image (with data:image/... prefix)
 * @param {string} folder - Cloudinary folder (e.g., 'gallery/events', 'carousel')
 * @param {object} options - Additional upload options
 * @returns {Promise<object>} - Upload result with URL, public_id, etc.
 */
export const uploadToCloudinary = async (base64Image, folder = 'schoolweb', options = {}) => {
    try {
        // Default options for optimization
        const uploadOptions = {
            folder: folder,
            resource_type: 'auto',
            transformation: [
                { quality: 'auto:good' },  // Automatic quality optimization
                { fetch_format: 'auto' }    // Automatic format selection (WebP when supported)
            ],
            ...options
        };

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64Image, uploadOptions);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            // Generate responsive URLs for different sizes
            thumbnailUrl: cloudinary.url(result.public_id, {
                transformation: [
                    { width: 400, height: 400, crop: 'fill', quality: 'auto:good' },
                    { fetch_format: 'auto' }
                ]
            }),
            mediumUrl: cloudinary.url(result.public_id, {
                transformation: [
                    { width: 800, crop: 'limit', quality: 'auto:good' },
                    { fetch_format: 'auto' }
                ]
            }),
            largeUrl: cloudinary.url(result.public_id, {
                transformation: [
                    { width: 1920, crop: 'limit', quality: 'auto:best' },
                    { fetch_format: 'auto' }
                ]
            }),
            blurUrl: cloudinary.url(result.public_id, {
                transformation: [
                    { width: 50, height: 50, crop: 'fill', quality: 'auto:low', effect: 'blur:1000' },
                    { fetch_format: 'auto' }
                ]
            })
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return {
            success: result.result === 'ok',
            result: result.result
        };
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Generate responsive image URLs for existing Cloudinary images
 * @param {string} publicId - Cloudinary public ID
 * @returns {object} - URLs for different sizes
 */
export const getResponsiveUrls = (publicId) => {
    if (!publicId) return null;

    return {
        thumbnail: cloudinary.url(publicId, {
            transformation: [
                { width: 400, height: 400, crop: 'fill', quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        }),
        medium: cloudinary.url(publicId, {
            transformation: [
                { width: 800, crop: 'limit', quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        }),
        large: cloudinary.url(publicId, {
            transformation: [
                { width: 1920, crop: 'limit', quality: 'auto:best' },
                { fetch_format: 'auto' }
            ]
        }),
        blur: cloudinary.url(publicId, {
            transformation: [
                { width: 50, height: 50, crop: 'fill', quality: 'auto:low', effect: 'blur:1000' },
                { fetch_format: 'auto' }
            ]
        }),
        original: cloudinary.url(publicId, {
            transformation: [
                { quality: 'auto:best' },
                { fetch_format: 'auto' }
            ]
        })
    };
};

/**
 * Extract Cloudinary public_id from a URL
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @returns {string|null} - Extracted public_id or null
 */
export const extractPublicId = (cloudinaryUrl) => {
    try {
        if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string') return null;
        
        // Check if it's a Cloudinary URL
        if (!cloudinaryUrl.includes('cloudinary.com')) return null;
        
        // Example URL: https://res.cloudinary.com/dmefbwrme/image/upload/v1234567890/schoolweb/folder/image.jpg
        // Extract: schoolweb/folder/image
        const match = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
        if (match) {
            return match[1]; // Returns: schoolweb/folder/image
        }
        return null;
    } catch (error) {
        console.error('Error extracting public_id:', error);
        return null;
    }
};

/**
 * Check if a URL is a Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export const isCloudinaryUrl = (url) => {
    return url && typeof url === 'string' && url.includes('cloudinary.com');
};

/**
 * Upload video to Cloudinary with automatic optimization
 * @param {string} base64Video - Base64 encoded video (with data:video/... prefix)
 * @param {string} folder - Cloudinary folder (e.g., 'videos/events', 'carousel')
 * @param {object} options - Additional upload options
 * @returns {Promise<object>} - Upload result with URL, public_id, etc.
 */
export const uploadVideoToCloudinary = async (base64Video, folder = 'schoolweb/videos', options = {}) => {
    try {
        // Default options for video optimization
        const uploadOptions = {
            folder: folder,
            resource_type: 'video',
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ],
            ...options
        };

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64Video, uploadOptions);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            duration: result.duration,
            bytes: result.bytes,
            // Generate thumbnail and quality variants
            thumbnailUrl: cloudinary.url(result.public_id + '.jpg', {
                resource_type: 'video',
                transformation: [
                    { width: 640, height: 360, crop: 'fill', quality: 'auto:good', start_offset: '0' }
                ]
            }),
            sdUrl: cloudinary.url(result.public_id, {
                resource_type: 'video',
                transformation: [
                    { width: 854, height: 480, crop: 'limit', quality: 'auto:good', video_codec: 'auto' },
                    { fetch_format: 'auto' }
                ]
            }),
            hdUrl: cloudinary.url(result.public_id, {
                resource_type: 'video',
                transformation: [
                    { width: 1920, height: 1080, crop: 'limit', quality: 'auto:best', video_codec: 'auto' },
                    { fetch_format: 'auto' }
                ]
            })
        };
    } catch (error) {
        console.error('Cloudinary video upload error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Generate responsive video URLs for existing Cloudinary videos
 * @param {string} publicId - Cloudinary public ID
 * @returns {object} - URLs for different quality levels
 */
export const getResponsiveVideoUrls = (publicId) => {
    if (!publicId) return null;

    return {
        thumbnail: cloudinary.url(publicId + '.jpg', {
            resource_type: 'video',
            transformation: [
                { width: 640, height: 360, crop: 'fill', quality: 'auto:good', start_offset: '0' }
            ]
        }),
        sd: cloudinary.url(publicId, {
            resource_type: 'video',
            transformation: [
                { width: 854, height: 480, crop: 'limit', quality: 'auto:good', video_codec: 'auto' },
                { fetch_format: 'auto' }
            ]
        }),
        hd: cloudinary.url(publicId, {
            resource_type: 'video',
            transformation: [
                { width: 1920, height: 1080, crop: 'limit', quality: 'auto:best', video_codec: 'auto' },
                { fetch_format: 'auto' }
            ]
        }),
        original: cloudinary.url(publicId, {
            resource_type: 'video',
            transformation: [
                { quality: 'auto:best' },
                { fetch_format: 'auto' }
            ]
        })
    };
};

export default cloudinary;
