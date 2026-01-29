import express from 'express';
import Image from '../../models/Image.js';

const router = express.Router();

// Get active carousel images (public)
router.get('/', async (req, res) => {
    try {
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

export default router;
