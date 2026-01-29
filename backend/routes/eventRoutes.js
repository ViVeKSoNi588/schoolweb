import express from 'express';
import AnnualEvent from '../models/AnnualEvent.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all annual events (public)
router.get('/', async (req, res) => {
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

// Get all annual events (admin)
router.get('/admin/all', authMiddleware, async (req, res) => {
    try {
        const events = await AnnualEvent.find().sort({ order: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
});

// Add annual event (admin)
router.post('/', authMiddleware, async (req, res) => {
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
router.put('/:id', authMiddleware, async (req, res) => {
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
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await AnnualEvent.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting event', error: error.message });
    }
});

// Bulk add annual events (admin) - for initial setup
router.post('/bulk', authMiddleware, async (req, res) => {
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

export default router;
