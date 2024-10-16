require('dotenv').config();  // Add this line at the top of the file

const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./config/db');
const app = express();
const PORT = process.env.PORT || 5000;  // Changed to 5000

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');

// Use routes
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to SalonEase API');
});

// Connect to the database and start the server
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});

module.exports = app;
