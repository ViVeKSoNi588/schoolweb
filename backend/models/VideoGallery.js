import mongoose from 'mongoose';

const videoGallerySchema = new mongoose.Schema({
    src: { type: String, required: true }, // YouTube URL, video URL, or file path
    title: { type: String, required: true },
    category: { type: String, required: true, enum: ['events', 'sports', 'cultural', 'classroom', 'campus', 'other'], default: 'events' },
    description: { type: String, default: '' },
    type: { type: String, enum: ['youtube', 'facebook', 'instagram', 'vimeo', 'dailymotion', 'uploaded', 'url', 'direct'], default: 'youtube' },
    thumbnail: { type: String }, // Optional thumbnail image URL
    isActive: { type: Boolean, default: true },
    mimeType: { type: String }, // video/mp4, video/webm, etc.
    filename: { type: String }, // Stored filename for uploaded videos
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const VideoGallery = mongoose.model('VideoGallery', videoGallerySchema);
export default VideoGallery;
