import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import authMiddleware from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin || !await bcrypt.compare(password, admin.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin._id, username }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, username });
    } catch (error) {
        res.status(500).json({ message: 'Login error', error: error.message });
    }
});

// Verify Token
router.get('/verify', authMiddleware, (req, res) => {
    res.json({ valid: true, username: req.admin.username });
});

// Create Admin (first time setup)
router.post('/setup', async (req, res) => {
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
router.post('/reset', async (req, res) => {
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

export default router;
