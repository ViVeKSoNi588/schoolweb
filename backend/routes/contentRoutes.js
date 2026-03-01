import express from 'express';
import SiteContent from '../models/SiteContent.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all content (admin) — mounted at /api/admin/content → GET /api/admin/content
router.get('/', authMiddleware, async (req, res) => {
    try {
        const content = await SiteContent.find().sort({ key: 1 }).lean();
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching content', error: error.message });
    }
});

// Get content by key (public) — mounted at /api/content → GET /api/content/:key
router.get('/:key', async (req, res) => {
    try {
        const content = await SiteContent.findOne({ key: req.params.key, isActive: true }).lean();
        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
        res.json(content || { title: '', content: '', items: [] });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching content', error: error.message });
    }
});

// Get all content (admin) — legacy path kept for backwards compat
router.get('/admin/all', authMiddleware, async (req, res) => {
    try {
        const content = await SiteContent.find().sort({ key: 1 }).lean();
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching content', error: error.message });
    }
});

// Create or update content by key (admin)
router.post('/', authMiddleware, async (req, res) => {
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
router.delete('/:key', authMiddleware, async (req, res) => {
    try {
        await SiteContent.findOneAndDelete({ key: req.params.key });
        res.json({ message: 'Content deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting content', error: error.message });
    }
});

export default router;
