import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    src: { type: String, required: true }, // file URL or external URL
    title: { type: String, required: true },
    category: { type: String, required: true, enum: ['events', 'sports', 'cultural', 'classroom', 'campus', 'other'] },
    description: { type: String, default: '' },
    year: { type: String, default: '2025-26' }, // Academic year
    isActive: { type: Boolean, default: true },
    isUploaded: { type: Boolean, default: false }, // true if uploaded image
    mimeType: { type: String }, // image/jpeg, image/png, etc.
    filename: { type: String }, // Stored filename for uploaded images
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
