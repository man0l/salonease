const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration route
router.post('/register', authController.register);

// Email verification route
router.get('/verify-email', authController.verifyEmail);

module.exports = router;
