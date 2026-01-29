import mongoose from 'mongoose';

const curriculumSchema = new mongoose.Schema({
    level: { type: String, required: true, unique: true }, // preprimary, primary, middle, secondary, senior
    title: { type: String, required: true },
    age: { type: String, default: '' },
    description: { type: String, default: '' },
    subjects: [{
        name: { type: String, required: true },
        icon: { type: String, default: '📚' },
        details: { type: String }
    }],
    streams: [{ // Only for senior secondary
        name: { type: String },
        icon: { type: String },
        subjects: [{ type: String }]
    }],
    highlights: [{ type: String }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

const Curriculum = mongoose.model('Curriculum', curriculumSchema);
export default Curriculum;
