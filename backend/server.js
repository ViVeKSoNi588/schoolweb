/* eslint-env node */
/* global process, Buffer */
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolweb';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS // Use App Password for Gmail
  }
});

// Function to send email notification
const sendFeedbackNotification = async (feedbackData, feedbackId, readToken) => {
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

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));

// Serve uploaded videos as static files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = join(__dirname, 'uploads', 'videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ============ SCHEMAS ============

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Admin = mongoose.model('Admin', adminSchema);

// Image Schema (for carousel)
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

// Video Schema
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
  createdAt: { type: Date, default: Date.now }
});
const Video = mongoose.model('Video', videoSchema);

// Site Content Schema (for editable content sections)
const siteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'video_section_info'
  title: { type: String },
  content: { type: String },
  items: [{ type: String }], // For bullet points/list items
  isActive: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});
const SiteContent = mongoose.model('SiteContent', siteContentSchema);

// Feedback Schema
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

// Gallery Schema (for gallery photos)
const gallerySchema = new mongoose.Schema({
  src: { type: String, required: true }, // file URL or external URL
  title: { type: String, required: true },
  category: { type: String, required: true, enum: ['events', 'sports', 'cultural', 'classroom', 'campus', 'other'] },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isUploaded: { type: Boolean, default: false }, // true if uploaded image
  mimeType: { type: String }, // image/jpeg, image/png, etc.
  filename: { type: String }, // Stored filename for uploaded images
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const Gallery = mongoose.model('Gallery', gallerySchema);

// Curriculum Schema
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

// Annual Event Schema
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

// Auto-cleanup function: Delete feedback that was read more than 3 months ago
const cleanupOldFeedback = async () => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const result = await Feedback.deleteMany({
      isRead: true,
      readAt: { $lte: threeMonthsAgo }
    });
    
    if (result.deletedCount > 0) {
      console.log(`🗑️ Auto-cleanup: Deleted ${result.deletedCount} old read feedback entries`);
    }
  } catch (error) {
    console.error('❌ Error in feedback cleanup:', error.message);
  }
};

// Run cleanup on server start
setTimeout(() => cleanupOldFeedback(), 5000);

// Run cleanup every 24 hours
setInterval(() => cleanupOldFeedback(), 24 * 60 * 60 * 1000);

// Generic Collection for any data (schema kept for reference)
// const dynamicSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

// ============ AUTH MIDDLEWARE ============
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ============ AUTH ROUTES ============

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (!admin || !await bcrypt.compare(password, admin.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: admin._id, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

// Verify Token
app.get('/api/admin/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, username: req.admin.username });
});

// Create Admin (first time setup)
app.post('/api/admin/setup', async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists. Use reset endpoint.' });
    }
    
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Setup error', error: error.message });
  }
});

// Reset Admin Password
app.post('/api/admin/reset', async (req, res) => {
  try {
    const { username, password } = req.body;
    await Admin.deleteMany({});
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();
    res.status(201).json({ message: 'Admin reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Reset error', error: error.message });
  }
});

// ============ PUBLIC IMAGE ROUTES ============

// Get active carousel images (public)
app.get('/api/images', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) {
      // Include images with matching category OR images with no category (for 'home')
      if (category === 'home') {
        filter.$or = [
          { category: 'home' },
          { category: { $exists: false } },
          { category: null },
          { category: '' }
        ];
      } else {
        filter.category = category;
      }
    }
    const images = await Image.find(filter).sort({ order: 1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
});

// ============ ADMIN IMAGE ROUTES ============

// Get ALL images (admin)
app.get('/api/admin/images', authMiddleware, async (req, res) => {
  try {
    const images = await Image.find().sort({ order: 1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
});

// Add image (supports both URL and base64 upload)
app.post('/api/admin/images', authMiddleware, async (req, res) => {
  try {
    const { src, alt, order, isActive, isUploaded, mimeType, category } = req.body;
    const image = new Image({
      src,
      alt,
      order: order || 0,
      isActive: isActive !== false,
      isUploaded: isUploaded || false,
      mimeType: mimeType || null,
      category: category || 'home'
    });
    await image.save();
    res.status(201).json(image);
  } catch (error) {
    res.status(400).json({ message: 'Error adding image', error: error.message });
  }
});

// Upload image - saves to disk instead of storing base64
app.post('/api/admin/images/upload', authMiddleware, async (req, res) => {
  try {
    const { imageData, alt, order, isActive, category } = req.body;
    
    if (!imageData || !imageData.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image data. Must be base64 encoded image.' });
    }
    
    // Extract mime type and extension
    const mimeMatch = imageData.match(/^data:(image\/(\w+));base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const extension = mimeMatch ? mimeMatch[2] : 'jpg';
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    
    // Generate unique filename
    const filename = `img_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${extension}`;
    const filepath = join(__dirname, 'uploads', 'images', filename);
    
    // Save image file to disk
    fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
    
    // Store only the URL reference in MongoDB
    const imageUrl = `/uploads/images/${filename}`;
    
    const image = new Image({
      src: imageUrl,
      alt: alt || 'Uploaded image',
      order: order || 0,
      isActive: isActive !== false,
      isUploaded: true,
      mimeType,
      filename,
      category: category || 'home'
    });
    await image.save();
    
    res.status(201).json({
      _id: image._id,
      src: image.src,
      alt: image.alt,
      order: image.order,
      isActive: image.isActive,
      isUploaded: image.isUploaded,
      mimeType: image.mimeType,
      category: image.category,
      createdAt: image.createdAt
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(400).json({ message: 'Error uploading image', error: error.message });
  }
});

// Update image
app.put('/api/admin/images/:id', authMiddleware, async (req, res) => {
  try {
    const image = await Image.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(image);
  } catch (error) {
    res.status(400).json({ message: 'Error updating image', error: error.message });
  }
});

// Delete image
app.delete('/api/admin/images/:id', authMiddleware, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // If it's an uploaded image, delete the file from disk
    if (image.isUploaded && image.filename) {
      const filepath = join(__dirname, 'uploads', 'images', image.filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
    
    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting image', error: error.message });
  }
});

// ============ PUBLIC VIDEO ROUTES ============

// Get active videos (public)
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find({ isActive: true }).sort({ order: 1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
});

// ============ ADMIN VIDEO ROUTES ============

// Get ALL videos (admin)
app.get('/api/admin/videos', authMiddleware, async (req, res) => {
  try {
    const videos = await Video.find().sort({ order: 1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
});

// Add video (YouTube URL or direct video URL)
app.post('/api/admin/videos', authMiddleware, async (req, res) => {
  try {
    const { title, description, src, type, thumbnail, order, isActive } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!src || !src.trim()) {
      return res.status(400).json({ message: 'Video source URL is required' });
    }
    
    const video = new Video({
      title: title.trim(),
      description: description || '',
      src: src.trim(),
      type: type || 'youtube',
      thumbnail: thumbnail || null,
      order: order || 0,
      isActive: isActive !== false
    });
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    console.error('Error adding video:', error);
    res.status(400).json({ message: 'Error adding video', error: error.message });
  }
});

// Upload video as base64 - NOW SAVES TO DISK
app.post('/api/admin/videos/upload', authMiddleware, async (req, res) => {
  try {
    const { videoData, title, description, thumbnail, order, isActive } = req.body;
    
    if (!videoData || !videoData.startsWith('data:video/')) {
      return res.status(400).json({ message: 'Invalid video data. Must be base64 encoded video.' });
    }
    
    // Extract mime type and base64 data
    const mimeMatch = videoData.match(/^data:(video\/(\w+));base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'video/mp4';
    const extension = mimeMatch ? mimeMatch[2] : 'mp4';
    const base64Data = videoData.replace(/^data:video\/\w+;base64,/, '');
    
    // Generate unique filename
    const filename = `video_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${extension}`;
    const filepath = join(__dirname, 'uploads', 'videos', filename);
    
    // Save video file to disk
    fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
    
    // Store only the URL reference in MongoDB (not the video data)
    const videoUrl = `/uploads/videos/${filename}`;
    
    const video = new Video({
      title: title || 'Uploaded video',
      description,
      src: videoUrl,  // Store URL, not base64
      type: 'uploaded',
      thumbnail,
      order: order || 0,
      isActive: isActive !== false,
      mimeType,
      filename  // Store filename for deletion
    });
    await video.save();
    
    // Return video without large data
    res.status(201).json({
      _id: video._id,
      title: video.title,
      description: video.description,
      src: video.src,
      type: video.type,
      thumbnail: video.thumbnail,
      order: video.order,
      isActive: video.isActive,
      mimeType: video.mimeType,
      createdAt: video.createdAt
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(400).json({ message: 'Error uploading video', error: error.message });
  }
});

// Update video
app.put('/api/admin/videos/:id', authMiddleware, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(video);
  } catch (error) {
    res.status(400).json({ message: 'Error updating video', error: error.message });
  }
});

// Delete video
app.delete('/api/admin/videos/:id', authMiddleware, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // If it's an uploaded video, delete the file from disk
    if (video.type === 'uploaded' && video.filename) {
      const filepath = join(__dirname, 'uploads', 'videos', video.filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
    
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting video', error: error.message });
  }
});

// ============ SITE CONTENT ROUTES ============

// Get content by key (public)
app.get('/api/content/:key', async (req, res) => {
  try {
    const content = await SiteContent.findOne({ key: req.params.key, isActive: true });
    res.json(content || { title: '', content: '', items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
});

// Get all content (admin)
app.get('/api/admin/content', authMiddleware, async (req, res) => {
  try {
    const content = await SiteContent.find().sort({ key: 1 });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
});

// Create or update content by key (admin)
app.post('/api/admin/content', authMiddleware, async (req, res) => {
  try {
    const { key, title, content, items, isActive } = req.body;
    if (!key) {
      return res.status(400).json({ message: 'Key is required' });
    }
    
    const updated = await SiteContent.findOneAndUpdate(
      { key },
      { key, title, content, items: items || [], isActive: isActive !== false, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Error saving content', error: error.message });
  }
});

// Delete content (admin)
app.delete('/api/admin/content/:key', authMiddleware, async (req, res) => {
  try {
    await SiteContent.findOneAndDelete({ key: req.params.key });
    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting content', error: error.message });
  }
});

// ============ FEEDBACK ROUTES ============

// Submit feedback (public)
app.post('/api/feedback', async (req, res) => {
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
    sendFeedbackNotification({ name, email, phone, subject, message }, feedback._id, readToken);
    
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error submitting feedback', error: error.message });
  }
});

// Get all feedback (admin)
app.get('/api/admin/feedback', authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ submittedAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
});

// Mark feedback as read (admin)
app.put('/api/admin/feedback/:id/read', authMiddleware, async (req, res) => {
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
app.delete('/api/admin/feedback/:id', authMiddleware, async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting feedback', error: error.message });
  }
});

// Mark feedback as read via email link (public - uses secure token)
app.get('/api/feedback/:id/mark-read/:token', async (req, res) => {
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

// ============ DATABASE MANAGEMENT ROUTES ============

// Get all collections in database
app.get('/api/admin/collections', authMiddleware, async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionStats = await Promise.all(
      collections.map(async (col) => {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        return { name: col.name, count };
      })
    );
    res.json(collectionStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collections', error: error.message });
  }
});

// Get all documents from a collection
app.get('/api/admin/collections/:name', authMiddleware, async (req, res) => {
  try {
    const { name } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    const documents = await mongoose.connection.db
      .collection(name)
      .find({})
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await mongoose.connection.db.collection(name).countDocuments();
    
    res.json({ documents, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// Add document to collection
app.post('/api/admin/collections/:name', authMiddleware, async (req, res) => {
  try {
    const { name } = req.params;
    const result = await mongoose.connection.db.collection(name).insertOne(req.body);
    res.status(201).json({ message: 'Document added', insertedId: result.insertedId });
  } catch (error) {
    res.status(400).json({ message: 'Error adding document', error: error.message });
  }
});

// Update document in collection
app.put('/api/admin/collections/:name/:id', authMiddleware, async (req, res) => {
  try {
    const { name, id } = req.params;
    const { _id, ...updateData } = req.body;
    
    await mongoose.connection.db.collection(name).updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData }
    );
    res.json({ message: 'Document updated' });
  } catch (error) {
    res.status(400).json({ message: 'Error updating document', error: error.message });
  }
});

// Delete document from collection
app.delete('/api/admin/collections/:name/:id', authMiddleware, async (req, res) => {
  try {
    const { name, id } = req.params;
    await mongoose.connection.db.collection(name).deleteOne({ 
      _id: new mongoose.Types.ObjectId(id) 
    });
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting document', error: error.message });
  }
});

// Create new collection
app.post('/api/admin/collections', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    await mongoose.connection.db.createCollection(name);
    res.status(201).json({ message: `Collection '${name}' created` });
  } catch (error) {
    res.status(400).json({ message: 'Error creating collection', error: error.message });
  }
});

// Drop collection
app.delete('/api/admin/collections/:name', authMiddleware, async (req, res) => {
  try {
    const { name } = req.params;
    await mongoose.connection.db.collection(name).drop();
    res.json({ message: `Collection '${name}' dropped` });
  } catch (error) {
    res.status(400).json({ message: 'Error dropping collection', error: error.message });
  }
});

// Import data to collection
app.post('/api/admin/import/:name', authMiddleware, async (req, res) => {
  try {
    const { name } = req.params;
    const { documents } = req.body;
    
    if (!Array.isArray(documents)) {
      return res.status(400).json({ message: 'Documents must be an array' });
    }
    
    const result = await mongoose.connection.db.collection(name).insertMany(documents);
    res.json({ message: `Imported ${result.insertedCount} documents` });
  } catch (error) {
    res.status(400).json({ message: 'Error importing data', error: error.message });
  }
});

// Export collection data
app.get('/api/admin/export/:name', authMiddleware, async (req, res) => {
  try {
    const { name } = req.params;
    const documents = await mongoose.connection.db.collection(name).find({}).toArray();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting data', error: error.message });
  }
});

// Database stats
app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await mongoose.connection.db.stats();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.json({
      database: stats.db,
      collections: collections.length,
      documents: stats.objects,
      storageSize: (stats.storageSize / 1024 / 1024).toFixed(2) + ' MB',
      indexes: stats.indexes
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// ============ PUBLIC GALLERY ROUTES ============

// Get active gallery photos (public)
app.get('/api/gallery', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'all') {
      filter.category = category;
    }
    const photos = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery photos', error: error.message });
  }
});

// Get gallery categories with photo counts (public)
app.get('/api/gallery/categories', async (req, res) => {
  try {
    const categories = await Gallery.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// ============ ADMIN GALLERY ROUTES ============

// Get ALL gallery photos (admin)
app.get('/api/admin/gallery', authMiddleware, async (req, res) => {
  try {
    const photos = await Gallery.find().sort({ order: 1, createdAt: -1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery photos', error: error.message });
  }
});

// Add gallery photo (URL)
app.post('/api/admin/gallery', authMiddleware, async (req, res) => {
  try {
    const { src, title, category, description, order, isActive } = req.body;
    
    if (!src || !title || !category) {
      return res.status(400).json({ message: 'Source, title, and category are required' });
    }
    
    const photo = new Gallery({
      src,
      title,
      category,
      description: description || '',
      order: order || 0,
      isActive: isActive !== false,
      isUploaded: false
    });
    await photo.save();
    res.status(201).json(photo);
  } catch (error) {
    res.status(400).json({ message: 'Error adding gallery photo', error: error.message });
  }
});

// Upload gallery photo - saves to disk instead of base64
app.post('/api/admin/gallery/upload', authMiddleware, async (req, res) => {
  try {
    const { imageData, title, category, description, order, isActive } = req.body;
    
    if (!imageData || !imageData.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image data. Must be base64 encoded image.' });
    }
    
    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }
    
    // Extract mime type and extension
    const mimeMatch = imageData.match(/^data:(image\/(\w+));base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const extension = mimeMatch ? mimeMatch[2] : 'jpg';
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    
    // Generate unique filename
    const filename = `gallery_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${extension}`;
    const filepath = join(__dirname, 'uploads', 'images', filename);
    
    // Save image file to disk
    fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
    
    // Store only the URL reference in MongoDB
    const imageUrl = `/uploads/images/${filename}`;
    
    const photo = new Gallery({
      src: imageUrl,
      title,
      category,
      description: description || '',
      order: order || 0,
      isActive: isActive !== false,
      isUploaded: true,
      mimeType,
      filename
    });
    await photo.save();
    res.status(201).json(photo);
  } catch (error) {
    console.error('Error uploading gallery photo:', error);
    res.status(400).json({ message: 'Error uploading gallery photo', error: error.message });
  }
});

// Update gallery photo
app.put('/api/admin/gallery/:id', authMiddleware, async (req, res) => {
  try {
    const photo = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    res.json(photo);
  } catch (error) {
    res.status(400).json({ message: 'Error updating gallery photo', error: error.message });
  }
});

// Delete gallery photo
app.delete('/api/admin/gallery/:id', authMiddleware, async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    // If it's an uploaded image, delete the file from disk
    if (photo.isUploaded && photo.filename) {
      const filepath = join(__dirname, 'uploads', 'images', photo.filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
    
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gallery photo deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting gallery photo', error: error.message });
  }
});

// Bulk delete gallery photos
app.post('/api/admin/gallery/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Photo IDs are required' });
    }
    const result = await Gallery.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${result.deletedCount} photos deleted` });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting gallery photos', error: error.message });
  }
});

// ============ PUBLIC CURRICULUM ROUTES ============

// Get all curriculum levels (public)
app.get('/api/curriculum', async (req, res) => {
  try {
    const curriculum = await Curriculum.find({ isActive: true }).sort({ order: 1 });
    res.json(curriculum);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching curriculum', error: error.message });
  }
});

// Get curriculum by level (public)
app.get('/api/curriculum/:level', async (req, res) => {
  try {
    const curriculum = await Curriculum.findOne({ level: req.params.level, isActive: true });
    res.json(curriculum);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching curriculum', error: error.message });
  }
});

// ============ ADMIN CURRICULUM ROUTES ============

// Get all curriculum (admin)
app.get('/api/admin/curriculum', authMiddleware, async (req, res) => {
  try {
    const curriculum = await Curriculum.find().sort({ order: 1 });
    res.json(curriculum);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching curriculum', error: error.message });
  }
});

// Add/Update curriculum level (admin)
app.post('/api/admin/curriculum', authMiddleware, async (req, res) => {
  try {
    const { level, title, age, description, subjects, streams, highlights, isActive, order } = req.body;
    
    if (!level || !title) {
      return res.status(400).json({ message: 'Level and title are required' });
    }
    
    const curriculum = await Curriculum.findOneAndUpdate(
      { level },
      { level, title, age, description, subjects: subjects || [], streams: streams || [], highlights: highlights || [], isActive: isActive !== false, order: order || 0, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(curriculum);
  } catch (error) {
    res.status(400).json({ message: 'Error saving curriculum', error: error.message });
  }
});

// Update curriculum by ID (admin)
app.put('/api/admin/curriculum/:id', authMiddleware, async (req, res) => {
  try {
    const curriculum = await Curriculum.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum not found' });
    }
    res.json(curriculum);
  } catch (error) {
    res.status(400).json({ message: 'Error updating curriculum', error: error.message });
  }
});

// Delete curriculum by ID (admin)
app.delete('/api/admin/curriculum/:id', authMiddleware, async (req, res) => {
  try {
    await Curriculum.findByIdAndDelete(req.params.id);
    res.json({ message: 'Curriculum deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting curriculum', error: error.message });
  }
});

// ============ PUBLIC ANNUAL EVENTS ROUTES ============

// Get all annual events (public)
app.get('/api/annual-events', async (req, res) => {
  try {
    const { month } = req.query;
    const filter = { isActive: true };
    if (month && month !== 'all') {
      filter.month = month;
    }
    const events = await AnnualEvent.find(filter).sort({ order: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// ============ ADMIN ANNUAL EVENTS ROUTES ============

// Get all annual events (admin)
app.get('/api/admin/annual-events', authMiddleware, async (req, res) => {
  try {
    const events = await AnnualEvent.find().sort({ order: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Add annual event (admin)
app.post('/api/admin/annual-events', authMiddleware, async (req, res) => {
  try {
    const { month, date, title, type, icon, description, isActive, order } = req.body;
    
    if (!month || !title || !type) {
      return res.status(400).json({ message: 'Month, title, and type are required' });
    }
    
    const event = new AnnualEvent({
      month,
      date,
      title,
      type,
      icon: icon || '📅',
      description: description || '',
      isActive: isActive !== false,
      order: order || 0
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: 'Error adding event', error: error.message });
  }
});

// Update annual event (admin)
app.put('/api/admin/annual-events/:id', authMiddleware, async (req, res) => {
  try {
    const event = await AnnualEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: 'Error updating event', error: error.message });
  }
});

// Delete annual event (admin)
app.delete('/api/admin/annual-events/:id', authMiddleware, async (req, res) => {
  try {
    await AnnualEvent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting event', error: error.message });
  }
});

// Bulk add annual events (admin) - for initial setup
app.post('/api/admin/annual-events/bulk', authMiddleware, async (req, res) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ message: 'Events array is required' });
    }
    const result = await AnnualEvent.insertMany(events);
    res.json({ message: `${result.length} events added` });
  } catch (error) {
    res.status(400).json({ message: 'Error adding events', error: error.message });
  }
});

// ============ START SERVER ============
// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
export default app;
