import mongoose from 'mongoose';

const siteContentSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'video_section_info'
    title: { type: String },
    content: { type: String },
    items: [{ type: String }], // For bullet points/list items
    isActive: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
});

const SiteContent = mongoose.model('SiteContent', siteContentSchema);
export default SiteContent;
