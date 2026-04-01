const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail, storeOTP, verifyOTP, generateOTP } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'secretxyz123';

// ─── Auth Middleware (inline) ───────────────────────────────────────────────
function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, not authorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Invalid token' });
  }
}

// ─── POST /send-otp ──────────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email is required' });

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'Email already registered' });

    const otp = generateOTP();
    storeOTP(email, otp);

    try {
        await sendOTPEmail(email, otp, name);
        res.json({ msg: 'OTP sent successfully! Check your email.' });
    } catch (err) {
        console.error('Email send error:', err.message);
        // FALLBACK: Log OTP to console so dev can still test
        console.log(`\n📧 OTP for ${email}: ${otp} (email failed, use this to test)\n`);
        res.json({ msg: `OTP sent! (Check server console if email fails) — for testing: ${otp}` });
    }
});

// ─── POST /verify-otp ─────────────────────────────────────────────────────────
router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const result = verifyOTP(email, otp);
    if (!result.valid) return res.status(400).json({ msg: result.msg });
    res.json({ msg: 'OTP verified successfully!' });
});

// ─── POST /register ─────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, username, password } = req.body;
  try {
    if (await User.findOne({ username })) {
      return res.status(400).json({ msg: 'Student ID already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await new User({ name, email, username, password: hashed, role: 'student' }).save();
    const token = jwt.sign({ user: { id: user.id, role: user.role } }, JWT_SECRET, { expiresIn: '10h' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).send('Server error');
  }
});

// ─── POST /login ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Guaranteed admin bypass — no DB needed
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign({ user: { id: 'admin-static-id', role: 'admin' } }, JWT_SECRET, { expiresIn: '10h' });
      return res.json({ token, role: 'admin' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const token = jwt.sign({ user: { id: user.id, role: user.role } }, JWT_SECRET, { expiresIn: '10h' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
});

// ─── GET /progress ───────────────────────────────────────────────────────────
router.get('/progress', auth, async (req, res) => {
  try {
    if (req.user.id === 'admin-static-id') return res.json({});
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.progress || {});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ─── POST /progress ──────────────────────────────────────────────────────────
router.post('/progress', auth, async (req, res) => {
  const { topicId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    let prog = user.progress || new Map();
    if (prog.get(String(topicId))) {
      prog.delete(String(topicId));
    } else {
      prog.set(String(topicId), true);
    }
    user.progress = prog;
    await user.save();
    res.json(user.progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ─── GET /users (Admin only) ─────────────────────────────────────────────────
router.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });
    const users = await User.find({ role: 'student' }).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─── DELETE /users/:id (Admin only) ─────────────────────────────────────────
router.delete('/users/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─── POST /bookmark (toggle) ─────────────────────────────────────────────────
router.post('/bookmark', auth, async (req, res) => {
  try {
    const { topicName } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.bookmarks = user.bookmarks || [];
    const idx = user.bookmarks.indexOf(topicName);
    if (idx === -1) user.bookmarks.push(topicName);
    else user.bookmarks.splice(idx, 1);
    await user.save();
    res.json(user.bookmarks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ─── GET /bookmarks ───────────────────────────────────────────────────────────
router.get('/bookmarks', auth, async (req, res) => {
  try {
    if (req.user.id === 'admin-static-id') return res.json([]);
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.bookmarks || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/update-user
// @desc    Update a user profile (Admin Only)
router.post('/update-user', auth, async (req, res) => {
    const { id, name, username, role, password } = req.body;
    try {
        // Ensure request is from an admin
        const admin = await User.findById(req.user.id);
        if (admin.role !== 'admin') return res.status(403).json({ msg: 'Not authorized' });

        let user = await User.findById(id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.name = name || user.name;
        user.username = username || user.username;
        user.role = role || user.role;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json({ msg: 'User updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
