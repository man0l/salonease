const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration route
router.post('/register', authController.register);

// Email verification route
router.get('/verify-email', authController.verifyEmail);

// Login route
router.post('/login', authController.login);

module.exports = router;
