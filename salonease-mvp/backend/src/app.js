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
const staffAvailabilityRoutes = require('./routes/staffAvailabilityRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const clientRoutes = require('./routes/clientRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const publicRoutes = require('./routes/publicRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const facebookRoutes = require('./routes/facebookRoutes');
// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);


app.use('/api/salons', salonRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/staff-availability', staffAvailabilityRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/billing', invoiceRoutes);
app.use('/api/facebook', facebookRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to ZenManager API');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use('/uploads', express.static('uploads'));

module.exports = app;
