import express from 'express';
import Image from '../models/Image.js';
import Video from '../models/Video.js';
import SiteContent from '../models/SiteContent.js';

const router = express.Router();

/**
 * GET /api/home
 * Returns all data needed by the home page in a single request.
 * Uses Promise.all so all 4 MongoDB queries run in parallel.
 * Reduces 4 separate round-trips → 1 round-trip on cold start.
 */
router.get('/', async (req, res) => {
  try {
    const [carousel, videos, content, announcements] = await Promise.all([
      Image.find({ isActive: true, category: 'home' }).sort({ order: 1 }),
      Video.find({ isActive: true }).sort({ order: 1 }),
      SiteContent.findOne({ key: 'video_section_info' }),
      SiteContent.findOne({ key: 'announcements' }),
    ]);

    res.json({ carousel, videos, content, announcements });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching home data', error: error.message });
  }
});

export default router;
