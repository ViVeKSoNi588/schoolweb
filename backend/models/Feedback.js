import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null }, // When feedback was marked as read
    readToken: { type: String }, // Token for marking as read from email
    submittedAt: { type: Date, default: Date.now }
});
// Create sparse index on readToken (allows multiple null values)
feedbackSchema.index({ readToken: 1 }, { unique: true, sparse: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
