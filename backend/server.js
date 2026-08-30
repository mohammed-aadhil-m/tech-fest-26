const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const submissionRoutes = require('./routes/submissions');
const winnerRoutes = require('./routes/winners');
const galleryRoutes = require('./routes/gallery');
const settingRoutes = require('./routes/settings');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const teamRoutes = require('./routes/teams');

// Connect to MongoDB
connectDB();

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/teams', teamRoutes);

// Admin API Routes (all protected)
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'TECH FEST 26 API is running', timestamp: new Date() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  });
} else {
  // 404 Handler for development API routes
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
  });
}

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 TECH FEST 26 Backend running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS Origin: ${process.env.FRONTEND_URL}`);
});

module.exports = app;
