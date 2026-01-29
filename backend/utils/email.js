import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const PORT = process.env.PORT || 5000;

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS // Use App Password for Gmail
    }
});

// Function to send email notification
export const sendFeedbackNotification = async (feedbackData, feedbackId, readToken) => {
    if (!EMAIL_USER || !ADMIN_EMAIL) {
        console.log('Email not configured - skipping notification');
        return;
    }

    // Check if this is an admission inquiry
    const isAdmission = feedbackData.subject && feedbackData.subject.toLowerCase().includes('admission');

    // Mark as read URL (using backend URL)
    const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
    const markAsReadUrl = `${BASE_URL}/api/feedback/${feedbackId}/mark-read/${readToken}`;

    // Mark as read button HTML
    const markAsReadButton = `
    <div style="text-align: center; margin: 20px 0;">
      <a href="${markAsReadUrl}" 
         style="display: inline-block; background: ${isAdmission ? '#059669' : '#1e40af'}; color: white; padding: 12px 30px; 
                text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
        ✓ Mark as Read
      </a>
      <p style="color: #9ca3af; font-size: 11px; margin-top: 8px;">
        Click to mark this ${isAdmission ? 'inquiry' : 'feedback'} as read (starts 3-month auto-delete timer)
      </p>
    </div>
  `;

    const mailOptions = {
        from: EMAIL_USER,
        to: ADMIN_EMAIL,
        subject: isAdmission
            ? `🎓 New Admission Inquiry: ${feedbackData.subject}`
            : `💬 New Feedback: ${feedbackData.subject}`,
        html: isAdmission ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #059669; border-radius: 10px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);">
        <h2 style="color: #047857; border-bottom: 2px solid #059669; padding-bottom: 10px;">🎓 New Admission Inquiry</h2>
        
        <div style="background: #ffffff; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #a7f3d0;">
          <p style="margin: 5px 0;"><strong>👤 Parent Name:</strong> ${feedbackData.name}</p>
          <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${feedbackData.email}</p>
          <p style="margin: 5px 0;"><strong>📱 Phone:</strong> ${feedbackData.phone || 'Not provided'}</p>
          <p style="margin: 5px 0;"><strong>📌 Subject:</strong> ${feedbackData.subject}</p>
        </div>
        
        <div style="background: #fff; padding: 15px; border-left: 4px solid #059669; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #047857;">Application Details:</h3>
          <p style="color: #374151; white-space: pre-wrap;">${feedbackData.message}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 10px 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #fbbf24;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">⚠️ <strong>Action Required:</strong> Please respond to this admission inquiry within 24-48 hours.</p>
        </div>
        
        ${markAsReadButton}
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          📅 Received at: ${new Date().toLocaleString()}
        </p>
        
        <hr style="border: none; border-top: 1px solid #a7f3d0; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 11px; text-align: center;">
          This is an automated notification from Vatsalya International School - Admissions Portal
        </p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">💬 New Feedback Received</h2>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>👤 Name:</strong> ${feedbackData.name}</p>
          <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${feedbackData.email}</p>
          <p style="margin: 5px 0;"><strong>📱 Phone:</strong> ${feedbackData.phone || 'Not provided'}</p>
          <p style="margin: 5px 0;"><strong>📌 Subject:</strong> ${feedbackData.subject}</p>
        </div>
        
        <div style="background: #fff; padding: 15px; border-left: 4px solid #1e40af; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #374151;">Message:</h3>
          <p style="color: #4b5563; white-space: pre-wrap;">${feedbackData.message}</p>
        </div>
        
        ${markAsReadButton}
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          📅 Received at: ${new Date().toLocaleString()}
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 11px; text-align: center;">
          This is an automated notification from Vatsalya International School Website
        </p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ ${isAdmission ? 'Admission inquiry' : 'Feedback'} notification email sent to:`, ADMIN_EMAIL);
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
    }
};
