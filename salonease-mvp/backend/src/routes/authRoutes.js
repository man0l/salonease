const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const staffController = require('../controllers/staffController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');
const { uploadSingle } = require('../utils/imageUpload');

// Registration route
router.post('/register', authController.register);

// Email verification route
router.get('/verify-email', authController.verifyEmail);

// Login route
router.post('/login', authController.login);

// Add this new route
router.get('/me', authMiddleware, authController.me);

// New routes for forgot password and reset password
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Add these new routes
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
// Public route for accepting invitations
router.post('/accept-invitation', staffController.acceptInvitation);

// Add this new route
router.post('/update', authMiddleware, uploadSingle, authController.updateUser);

// Add this new route
router.post('/complete-onboarding', 
  authMiddleware, 
  roleMiddleware([ROLES.SUPER_ADMIN, ROLES.SALON_OWNER]), 
  authController.completeOnboarding
);

module.exports = router;
