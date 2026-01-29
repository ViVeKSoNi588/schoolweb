import express from 'express';
import Curriculum from '../models/Curriculum.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all curriculum levels (public)
router.get('/', async (req, res) => {
    try {
        const curriculum = await Curriculum.find({ isActive: true }).sort({ order: 1 });
        res.json(curriculum);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching curriculum', error: error.message });
    }
});

// Get curriculum by level (public)
router.get('/:level', async (req, res) => {
    try {
        const curriculum = await Curriculum.findOne({ level: req.params.level, isActive: true });
        res.json(curriculum);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching curriculum', error: error.message });
    }
});

// Get all curriculum (admin)
router.get('/admin/all', authMiddleware, async (req, res) => {
    try {
        const curriculum = await Curriculum.find().sort({ order: 1 });
        res.json(curriculum);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching curriculum', error: error.message });
    }
});

// Add/Update curriculum level (admin)
router.post('/', authMiddleware, async (req, res) => {
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
router.put('/:id', authMiddleware, async (req, res) => {
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
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Curriculum.findByIdAndDelete(req.params.id);
        res.json({ message: 'Curriculum deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting curriculum', error: error.message });
    }
});

export default router;
