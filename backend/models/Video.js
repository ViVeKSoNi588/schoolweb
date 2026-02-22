import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    src: { type: String, required: true }, // YouTube URL, video URL, or file path
    type: { type: String, enum: ['youtube', 'facebook', 'instagram', 'vimeo', 'dailymotion', 'uploaded', 'url', 'direct'], default: 'youtube' },
    thumbnail: { type: String }, // Optional thumbnail image
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    mimeType: { type: String }, // video/mp4, video/webm, etc.
    filename: { type: String }, // Stored filename for uploaded videos
    // Cloudinary fields
    cloudinaryId: { type: String }, // Cloudinary public_id for deletion
    cloudinaryUrls: {
        thumbnail: String,  // Video thumbnail
        sd: String,         // Standard definition
        hd: String,         // High definition
        original: String    // Full quality
    },
    createdAt: { type: Date, default: Date.now }
});

const Video = mongoose.model('Video', videoSchema);
export default Video;
