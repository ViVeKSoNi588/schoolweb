import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    src: { type: String, required: true }, // URL or file path
    alt: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isUploaded: { type: Boolean, default: false }, // true if uploaded file
    mimeType: { type: String }, // image/jpeg, image/png, etc.
    filename: { type: String }, // Stored filename for uploaded images
    category: { type: String, default: 'home' }, // Category for filtering
    createdAt: { type: Date, default: Date.now }
});

const Image = mongoose.model('Image', imageSchema);
export default Image;
