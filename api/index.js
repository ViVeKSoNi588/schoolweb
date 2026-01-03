/* eslint-env node */
/* global process */
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const app = express();
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
    pass: EMAIL_PASS
  }
});

// Function to send email notification
const sendFeedbackNotification = async (feedbackData, feedbackId, readToken) => {
  if (!EMAIL_USER || !ADMIN_EMAIL) {
    console.log('Email not configured - skipping notification');
    return;
  }
  
  const isAdmission = feedbackData.subject && feedbackData.subject.toLowerCase().includes('admission');
  const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.BASE_URL || 'http://localhost:5000';
  const markAsReadUrl = `${BASE_URL}/api/feedback/${feedbackId}/mark-read/${readToken}`;
  
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
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">📅 Received at: ${new Date().toLocaleString()}</p>
        <hr style="border: none; border-top: 1px solid #a7f3d0; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 11px; text-align: center;">This is an automated notification from Vatsalya International School - Admissions Portal</p>
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
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">📅 Received at: ${new Date().toLocaleString()}</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 11px; text-align: center;">This is an automated notification from Vatsalya International School Website</p>
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
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection with caching for serverless
let cachedDb = null;
const connectDB = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    cachedDb = mongoose.connection;
    console.log('✅ Connected to MongoDB');
    return cachedDb;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};

// Connect on first request
connectDB();

// ============ SCHEMAS ============

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

const imageSchema = new mongoose.Schema({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isUploaded: { type: Boolean, default: false },
  mimeType: { type: String },
  category: { type: String, default: 'home' },
  createdAt: { type: Date, default: Date.now }
});
const Image = mongoose.models.Image || mongoose.model('Image', imageSchema);

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  src: { type: String, required: true },
  type: { type: String, enum: ['youtube', 'uploaded', 'url'], default: 'youtube' },
  thumbnail: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  mimeType: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);

const siteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String },
  content: { type: String },
  items: [{ type: String }],
  isActive: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});
const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', siteContentSchema);

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  readToken: { type: String },
  submittedAt: { type: Date, default: Date.now }
});
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

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

app.post('/api/admin/login', async (req, res) => {
  try {
    await connectDB();
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

app.get('/api/admin/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, username: req.admin.username });
});

app.post('/api/admin/setup', async (req, res) => {
  try {
    await connectDB();
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

app.post('/api/admin/reset', async (req, res) => {
  try {
    await connectDB();
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

app.get('/api/images', async (req, res) => {
  try {
    await connectDB();
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) {
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

app.get('/api/admin/images', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const images = await Image.find().sort({ order: 1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
});

app.post('/api/admin/images', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { src, alt, order, isActive, isUploaded, mimeType, category } = req.body;
    const image = new Image({
      src, alt, order: order || 0, isActive: isActive !== false,
      isUploaded: isUploaded || false, mimeType: mimeType || null, category: category || 'home'
    });
    await image.save();
    res.status(201).json(image);
  } catch (error) {
    res.status(400).json({ message: 'Error adding image', error: error.message });
  }
});

app.post('/api/admin/images/upload', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { imageData, alt, order, isActive, category } = req.body;
    if (!imageData || !imageData.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image data. Must be base64 encoded image.' });
    }
    const mimeMatch = imageData.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const image = new Image({
      src: imageData, alt: alt || 'Uploaded image', order: order || 0,
      isActive: isActive !== false, isUploaded: true, mimeType, category: category || 'home'
    });
    await image.save();
    res.status(201).json(image);
  } catch (error) {
    res.status(400).json({ message: 'Error uploading image', error: error.message });
  }
});

app.put('/api/admin/images/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const image = await Image.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(image);
  } catch (error) {
    res.status(400).json({ message: 'Error updating image', error: error.message });
  }
});

app.delete('/api/admin/images/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting image', error: error.message });
  }
});

// ============ PUBLIC VIDEO ROUTES ============

app.get('/api/videos', async (req, res) => {
  try {
    await connectDB();
    const videos = await Video.find({ isActive: true }).sort({ order: 1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
});

// ============ ADMIN VIDEO ROUTES ============

app.get('/api/admin/videos', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const videos = await Video.find().sort({ order: 1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
});

app.post('/api/admin/videos', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { title, description, src, type, thumbnail, order, isActive } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required' });
    if (!src || !src.trim()) return res.status(400).json({ message: 'Video source URL is required' });
    const video = new Video({
      title: title.trim(), description: description || '', src: src.trim(),
      type: type || 'youtube', thumbnail: thumbnail || null, order: order || 0, isActive: isActive !== false
    });
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(400).json({ message: 'Error adding video', error: error.message });
  }
});

app.post('/api/admin/videos/upload', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { videoData, title, description, thumbnail, order, isActive } = req.body;
    if (!videoData || !videoData.startsWith('data:video/')) {
      return res.status(400).json({ message: 'Invalid video data. Must be base64 encoded video.' });
    }
    const mimeMatch = videoData.match(/^data:(video\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'video/mp4';
    const video = new Video({
      title: title || 'Uploaded video', description, src: videoData, type: 'uploaded',
      thumbnail, order: order || 0, isActive: isActive !== false, mimeType
    });
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(400).json({ message: 'Error uploading video', error: error.message });
  }
});

app.put('/api/admin/videos/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(video);
  } catch (error) {
    res.status(400).json({ message: 'Error updating video', error: error.message });
  }
});

app.delete('/api/admin/videos/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting video', error: error.message });
  }
});

// ============ SITE CONTENT ROUTES ============

app.get('/api/content/:key', async (req, res) => {
  try {
    await connectDB();
    const content = await SiteContent.findOne({ key: req.params.key, isActive: true });
    res.json(content || { title: '', content: '', items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
});

app.get('/api/admin/content', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const content = await SiteContent.find().sort({ key: 1 });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
});

app.post('/api/admin/content', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { key, title, content, items, isActive } = req.body;
    if (!key) return res.status(400).json({ message: 'Key is required' });
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

app.delete('/api/admin/content/:key', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    await SiteContent.findOneAndDelete({ key: req.params.key });
    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting content', error: error.message });
  }
});

// ============ FEEDBACK ROUTES ============

app.post('/api/feedback', async (req, res) => {
  try {
    await connectDB();
    const { name, email, phone, subject, message, submittedAt } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject, and message are required' });
    }
    const readToken = crypto.randomBytes(32).toString('hex');
    const feedback = new Feedback({
      name, email, phone: phone || '', subject, message, readToken, submittedAt: submittedAt || new Date()
    });
    await feedback.save();
    sendFeedbackNotification({ name, email, phone, subject, message }, feedback._id, readToken);
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error submitting feedback', error: error.message });
  }
});

app.get('/api/admin/feedback', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const feedback = await Feedback.find().sort({ submittedAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
});

app.put('/api/admin/feedback/:id/read', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id, { isRead: true, readAt: new Date() }, { new: true }
    );
    res.json(feedback);
  } catch (error) {
    res.status(400).json({ message: 'Error updating feedback', error: error.message });
  }
});

app.delete('/api/admin/feedback/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting feedback', error: error.message });
  }
});

app.get('/api/feedback/:id/mark-read/:token', async (req, res) => {
  try {
    await connectDB();
    const { id, token } = req.params;
    const feedback = await Feedback.findOne({ _id: id, readToken: token });
    
    if (!feedback) {
      return res.status(404).send(`
        <html><head><title>Error</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #fee2e2;">
          <h1 style="color: #dc2626;">❌ Invalid or Expired Link</h1>
          <p style="color: #7f1d1d;">This feedback may have already been deleted or the link is invalid.</p>
        </body></html>
      `);
    }
    
    if (feedback.isRead) {
      return res.send(`
        <html><head><title>Already Read</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #fef3c7;">
          <h1 style="color: #d97706;">⚠️ Already Marked as Read</h1>
          <p style="color: #92400e;">This feedback was already marked as read on ${feedback.readAt?.toLocaleDateString()}.</p>
          <p style="color: #78716c; font-size: 14px;">It will be auto-deleted 3 months after that date.</p>
        </body></html>
      `);
    }
    
    feedback.isRead = true;
    feedback.readAt = new Date();
    await feedback.save();
    
    const isAdmission = feedback.subject?.toLowerCase().includes('admission');
    res.send(`
      <html><head><title>Marked as Read</title></head>
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
      </body></html>
    `);
  } catch (error) {
    console.error('Error marking feedback as read:', error);
    res.status(500).send(`
      <html><head><title>Error</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #fee2e2;">
        <h1 style="color: #dc2626;">❌ Error</h1>
        <p style="color: #7f1d1d;">Something went wrong. Please try again or use the admin panel.</p>
      </body></html>
    `);
  }
});

// ============ DATABASE MANAGEMENT ROUTES ============

app.get('/api/admin/collections', authMiddleware, async (req, res) => {
  try {
    await connectDB();
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

app.get('/api/admin/collections/:name', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { name } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    const documents = await mongoose.connection.db.collection(name).find({}).skip(skip).limit(parseInt(limit)).toArray();
    const total = await mongoose.connection.db.collection(name).countDocuments();
    res.json({ documents, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

app.post('/api/admin/collections/:name', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { name } = req.params;
    const result = await mongoose.connection.db.collection(name).insertOne(req.body);
    res.status(201).json({ message: 'Document added', insertedId: result.insertedId });
  } catch (error) {
    res.status(400).json({ message: 'Error adding document', error: error.message });
  }
});

app.put('/api/admin/collections/:name/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { name, id } = req.params;
    const { _id, ...updateData } = req.body;
    await mongoose.connection.db.collection(name).updateOne(
      { _id: new mongoose.Types.ObjectId(id) }, { $set: updateData }
    );
    res.json({ message: 'Document updated' });
  } catch (error) {
    res.status(400).json({ message: 'Error updating document', error: error.message });
  }
});

app.delete('/api/admin/collections/:name/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { name, id } = req.params;
    await mongoose.connection.db.collection(name).deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting document', error: error.message });
  }
});

app.post('/api/admin/collections', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { name } = req.body;
    await mongoose.connection.db.createCollection(name);
    res.status(201).json({ message: `Collection '${name}' created` });
  } catch (error) {
    res.status(400).json({ message: 'Error creating collection', error: error.message });
  }
});

app.delete('/api/admin/collections/:name', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { name } = req.params;
    await mongoose.connection.db.collection(name).drop();
    res.json({ message: `Collection '${name}' dropped` });
  } catch (error) {
    res.status(400).json({ message: 'Error dropping collection', error: error.message });
  }
});

app.post('/api/admin/import/:name', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { name } = req.params;
    const { documents } = req.body;
    if (!Array.isArray(documents)) return res.status(400).json({ message: 'Documents must be an array' });
    const result = await mongoose.connection.db.collection(name).insertMany(documents);
    res.json({ message: `Imported ${result.insertedCount} documents` });
  } catch (error) {
    res.status(400).json({ message: 'Error importing data', error: error.message });
  }
});

app.get('/api/admin/export/:name', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { name } = req.params;
    const documents = await mongoose.connection.db.collection(name).find({}).toArray();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting data', error: error.message });
  }
});

app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  try {
    await connectDB();
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

export default app;
