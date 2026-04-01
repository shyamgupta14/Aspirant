const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Announcement = require('../models/Announcement');

// Middleware to check auth
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'Denial: No authorization token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretxyz123');
        req.user = decoded.user;
        next();
    } catch (err) { res.status(401).json({ msg: 'Denial: Token invalid' }); }
};

// Middleware to check admin role
const adminOnly = (req, res, next) => {
    if(req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied: Admin only' });
    next();
};

// @route   GET /api/announcements
// @desc    Get the latest active announcement
router.get('/', async (req, res) => {
    try {
        const announcement = await Announcement.findOne({ active: true }).sort({ date: -1 });
        res.json(announcement);
    } catch (err) { res.status(500).send('Server Error'); }
});

// @route   POST /api/announcements
// @desc    Broadcast a new announcement (Admin Only)
router.post('/', auth, adminOnly, async (req, res) => {
    const { message } = req.body;
    try {
        // Deactivate old ones
        await Announcement.updateMany({ active: true }, { active: false });
        
        const newAnn = new Announcement({ message });
        await newAnn.save();
        res.json(newAnn);
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
