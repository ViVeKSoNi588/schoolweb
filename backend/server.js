/* eslint-env node */
/* global process */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Config
import connectDB from './config/db.js';

// Utils
import { startCleanupJob } from './utils/cleanup.js';

// Routes
import adminRoutes from './routes/adminRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import videoGalleryRoutes from './routes/videoGalleryRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import curriculumRoutes from './routes/curriculumRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import dbRoutes from './routes/dbRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));

// Serve uploaded videos and images as static files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDirs = [
  join(__dirname, 'uploads'),
  join(__dirname, 'uploads', 'videos'),
  join(__dirname, 'uploads', 'images')
];

try {
  uploadsDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
} catch (error) {
  console.warn('⚠️ Warning: Could not create upload directories (likely read-only environment like Vercel). File uploads may not work.');
}

// Connect to MongoDB
connectDB();

// Start periodic cleanup tasks
startCleanupJob();

// Routes
app.use('/api/admin', adminRoutes); // Login, Setup, Verify, Reset
app.use('/api/admin', dbRoutes);    // Collections, Stats, Import/Export (mounted under /api/admin for auth protection inside router)
// Note: dbRoutes uses 'authMiddleware' on all its routes internally, and paths are '/collections', '/stats' etc.
// So final path is /api/admin/collections etc. which matches original.

// Image Routes
app.use('/api/images', imageRoutes);       // Public: GET /
app.use('/api/admin/images', imageRoutes); // Admin: GET /admin, POST /, PUT /:id, DELETE /:id

// Video Routes
app.use('/api/videos', videoRoutes);       // Public: GET /
app.use('/api/admin/videos', videoRoutes); // Admin: GET /admin, POST /, PUT /:id, DELETE /:id

// Content Routes
app.use('/api/content', contentRoutes);       // Public: GET /:key
app.use('/api/admin/content', contentRoutes); // Admin: GET /admin/all, POST /, DELETE /:key

// Feedback Routes
app.use('/api/feedback', feedbackRoutes);       // Public: POST /, GET /:id/mark-read...
app.use('/api/admin/feedback', feedbackRoutes); // Admin: GET /admin, PUT /:id/read, DELETE /:id

// Gallery Routes
app.use('/api/gallery', galleryRoutes);       // Public: GET /, GET /categories
app.use('/api/admin/gallery', galleryRoutes); // Admin: GET /admin, POST /, PUT /:id, DELETE /:id

// Video Gallery Routes
app.use('/api/video-gallery', videoGalleryRoutes);       // Public: GET /, GET /categories
app.use('/api/admin/video-gallery', videoGalleryRoutes); // Admin: GET /admin, POST /, PUT /:id, DELETE /:id

// Curriculum Routes
app.use('/api/curriculum', curriculumRoutes);       // Public: GET /, GET /:level
app.use('/api/admin/curriculum', curriculumRoutes); // Admin: GET /admin/all, POST /, PUT /:id, DELETE /:id

// Annual Event Routes
app.use('/api/annual-events', eventRoutes);       // Public: GET /
app.use('/api/admin/annual-events', eventRoutes); // Admin: GET /admin/all, POST /, PUT /:id, DELETE /:id

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
