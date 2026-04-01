const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const jwt = require('jsonwebtoken');

// Middleware to check auth
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretxyz123');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Middleware to check admin role
const adminOnly = (req, res, next) => {
    if(req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied: Admin only' });
    }
    next();
}


// @route   GET /api/subjects
// @desc    Get all subjects and topics
router.get('/', async (req, res) => {
  try {
    let subjects = await Subject.find();
    // Insert default data if empty (migration logic)
    if (subjects.length === 0) {
       const initialData = [
            {
                name: "Operating Systems", chapters: [
                    {
                        name: "CH 01: General Concepts", topics: [
                            { id: 1, name: "Intro to OS", vid: "https://www.youtube-nocookie.com/embed/bkSWJJZNgf8", notes: "https://youtu.be/bkSWJJZNgf8", pyq: "#" },
                            { id: 2, name: "Context Switching", vid: "https://www.youtube-nocookie.com/embed/7sJx8a5cF0Y", notes: "#", pyq: "#" }
                        ]
                    }
                ]
            },
            {
                name: "DBMS", chapters: [
                    {
                        name: "CH 01: Relational Model", topics: [
                            { id: 3, name: "Normalization", vid: "https://www.youtube.com/embed/xoY88R_P9S4", notes: "#", pyq: "#" }
                        ]
                    }
                ]
            }
       ];
       await Subject.insertMany(initialData);
       subjects = await Subject.find();
    }
    res.json(subjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/subjects
// @desc    Create/Update subjects (Admin only)
// Note: for simplicity we can just receive the entire data tree and replace or update
router.post('/saveTree', auth, adminOnly, async (req, res) => {
   const { data } = req.body;
   try {
       // A full overwrite for simplicity in standardizing tree from client
       await Subject.deleteMany({});
       await Subject.insertMany(data);
       const subjects = await Subject.find();
       res.json(subjects);
   } catch (err) {
       console.error(err.message);
       res.status(500).send('Server Error');
   }
});

module.exports = router;
