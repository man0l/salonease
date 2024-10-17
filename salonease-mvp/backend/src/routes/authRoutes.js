const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Registration route
router.post('/register', authController.register);

// Email verification route
router.get('/verify-email', authController.verifyEmail);

// Login route
router.post('/login', authController.login);

// Add this new route
router.get('/me', authMiddleware, authController.me);

module.exports = router;
