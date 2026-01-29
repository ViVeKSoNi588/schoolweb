import express from 'express';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all collections in database
router.get('/collections', authMiddleware, async (req, res) => {
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
router.get('/collections/:name', authMiddleware, async (req, res) => {
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
router.post('/collections/:name', authMiddleware, async (req, res) => {
    try {
        const { name } = req.params;
        const result = await mongoose.connection.db.collection(name).insertOne(req.body);
        res.status(201).json({ message: 'Document added', insertedId: result.insertedId });
    } catch (error) {
        res.status(400).json({ message: 'Error adding document', error: error.message });
    }
});

// Update document in collection
router.put('/collections/:name/:id', authMiddleware, async (req, res) => {
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
router.delete('/collections/:name/:id', authMiddleware, async (req, res) => {
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
router.post('/collections', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        await mongoose.connection.db.createCollection(name);
        res.status(201).json({ message: `Collection '${name}' created` });
    } catch (error) {
        res.status(400).json({ message: 'Error creating collection', error: error.message });
    }
});

// Drop collection
router.delete('/collections/:name', authMiddleware, async (req, res) => {
    try {
        const { name } = req.params;
        await mongoose.connection.db.collection(name).drop();
        res.json({ message: `Collection '${name}' dropped` });
    } catch (error) {
        res.status(400).json({ message: 'Error dropping collection', error: error.message });
    }
});

// Import data to collection
router.post('/import/:name', authMiddleware, async (req, res) => {
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
router.get('/export/:name', authMiddleware, async (req, res) => {
    try {
        const { name } = req.params;
        const documents = await mongoose.connection.db.collection(name).find({}).toArray();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error exporting data', error: error.message });
    }
});

// Database stats
router.get('/stats', authMiddleware, async (req, res) => {
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

export default router;
