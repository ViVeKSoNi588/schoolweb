import mongoose from 'mongoose';

const annualEventSchema = new mongoose.Schema({
    month: { type: String, required: true },
    date: { type: String, default: '' },
    title: { type: String, required: true },
    type: { type: String, required: true, enum: ['academic', 'holiday', 'exam', 'sports', 'cultural', 'event'] },
    icon: { type: String, default: '📅' },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const AnnualEvent = mongoose.model('AnnualEvent', annualEventSchema);
export default AnnualEvent;
