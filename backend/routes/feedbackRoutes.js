import express from 'express';
import Feedback from '../models/Feedback.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { sendFeedbackNotification } from '../utils/email.js';
import crypto from 'crypto';

const router = express.Router();

// Submit feedback (public)
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message, submittedAt } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Name, email, subject, and message are required' });
        }

        // Generate unique token for email mark-as-read link
        const readToken = crypto.randomBytes(32).toString('hex');

        const feedback = new Feedback({
            name,
            email,
            phone: phone || '',
            subject,
            message,
            readToken,
            submittedAt: submittedAt || new Date()
        });
        await feedback.save();

        // Send email notification with mark-as-read link
        await sendFeedbackNotification({ name, email, phone, subject, message }, feedback._id, readToken);

        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error submitting feedback', error: error.message });
    }
});

// Get all feedback (admin)
router.get('/admin', authMiddleware, async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ submittedAt: -1 });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feedback', error: error.message });
    }
});

// Mark feedback as read (admin)
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        res.json(feedback);
    } catch (error) {
        res.status(400).json({ message: 'Error updating feedback', error: error.message });
    }
});

// Delete feedback (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting feedback', error: error.message });
    }
});

// Mark feedback as read via email link (public - uses secure token)
router.get('/:id/mark-read/:token', async (req, res) => {
    try {
        const { id, token } = req.params;

        const feedback = await Feedback.findOne({ _id: id, readToken: token });

        if (!feedback) {
            return res.status(404).send(`
        <html>
          <head><title>Error</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #fee2e2;">
            <h1 style="color: #dc2626;">❌ Invalid or Expired Link</h1>
            <p style="color: #7f1d1d;">This feedback may have already been deleted or the link is invalid.</p>
          </body>
        </html>
      `);
        }

        if (feedback.isRead) {
            return res.send(`
        <html>
          <head><title>Already Read</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #fef3c7;">
            <h1 style="color: #d97706;">⚠️ Already Marked as Read</h1>
            <p style="color: #92400e;">This feedback was already marked as read on ${feedback.readAt?.toLocaleDateString()}.</p>
            <p style="color: #78716c; font-size: 14px;">It will be auto-deleted 3 months after that date.</p>
          </body>
        </html>
      `);
        }

        // Mark as read
        feedback.isRead = true;
        feedback.readAt = new Date();
        await feedback.save();

        const isAdmission = feedback.subject?.toLowerCase().includes('admission');

        res.send(`
      <html>
        <head><title>Marked as Read</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: ${isAdmission ? '#ecfdf5' : '#eff6ff'};">
          <h1 style="color: ${isAdmission ? '#059669' : '#1e40af'};">✓ Marked as Read!</h1>
          <div style="background: white; max-width: 500px; margin: 20px auto; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p><strong>${isAdmission ? '🎓 Admission Inquiry' : '💬 Feedback'}</strong></p>
            <p><strong>From:</strong> ${feedback.name}</p>
            <p><strong>Subject:</strong> ${feedback.subject}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
            <p style="color: #f59e0b; font-size: 14px;">⏳ This will be auto-deleted in 3 months</p>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">You can close this tab now.</p>
        </body>
      </html>
    `);
    } catch (error) {
        console.error('Error marking feedback as read:', error);
        res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #fee2e2;">
          <h1 style="color: #dc2626;">❌ Error</h1>
          <p style="color: #7f1d1d;">Something went wrong. Please try again or use the admin panel.</p>
        </body>
      </html>
    `);
    }
});

export default router;
