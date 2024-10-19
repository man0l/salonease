require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const salonRoutes = require('./routes/salonRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/staff', staffRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to SalonEase API');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
