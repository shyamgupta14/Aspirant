require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins for Vercel deployment
app.use(express.json());

// Database Connection
const mongoUri = process.env.MONGO_URI || "mongodb+srv://shyamgupta9009_db_user:Shyam%40900@cluster0.hj7nguq.mongodb.net/aspirant?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
  });

// Health Check for Render
app.get('/api/health', (req, res) => res.json({ status: 'active', heartbeat: Date.now() }));

// Import Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/announcements', require('./routes/announcements'));

// Error Handling (Production)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Critical System Error' });
});

// Server Listen
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server started on port ${PORT}`));
app.get("/", (req, res) => {
  res.send("🔥 Aspirant Backend is Live!");
});