const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, RefreshToken: RefreshTokenModel, sequelize } = require('../config/db');
const { Op } = require('sequelize');
const emailHelper = require('../utils/helpers/emailHelper');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Add this at the beginning of the file
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in the environment variables');
  process.exit(1);
}

exports.register = async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log('Registering user:', { fullName, email });

  try {
    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ message: 'Email is invalid' });
    }

    // Improved password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log('Weak password:', password);
      return res.status(400).json({ message: 'Password must be at least 8 characters long and include lowercase and uppercase letters, numbers, and special characters.' });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create a new user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'SalonOwner',
      onboardingCompleted: false,
    });
    console.log('User created successfully:', newUser);

    // Generate an email verification token
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Verification token generated:', token);

    // Send verification email
    await emailHelper.sendVerificationEmail(email, token);
    console.log('Verification email sent to:', email);

    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  console.log('Verifying email with token:', token);

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    console.log('Token verified, userId:', userId);

    // Find the user and update the verification status
    const user = await User.findByPk(userId);
    if (!user) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    user.isEmailVerified = true;
    await user.save();
    console.log('Email verified for userId:', userId);

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Email verification failed:', error);
    res.status(400).json({ message: 'Invalid or expired token', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Logging in user:', email);

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if the email is verified
    if (!user.isEmailVerified) {
      console.log('Email not verified for user:', email);
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Generate a refresh token
    const refreshToken = uuidv4();
    await RefreshTokenModel.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    console.log('Login successful, tokens generated for user:', email);

    res.status(200).json({
      token,
      refreshToken,
      user: { 
        id: user.id, 
        fullName: user.fullName, 
        role: user.role,
        onboardingCompleted: user.onboardingCompleted 
      }
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Add this function to the existing authController.js file

exports.me = async (req, res) => {
  console.log('Fetching current user information');

  try {
    // The user information should be attached to the request by the auth middleware
    const user = req.user;

    if (!user) {
      console.log('User not found in request');
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user information (excluding sensitive data like password)
    res.status(200).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      onboardingCompleted: user.onboardingCompleted,
    });

    console.log('User information fetched successfully for userId:', user.id);
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).json({ message: 'Error fetching user information', error: error.message });
  }
};

// Add these new functions to the existing authController.js file

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log('Forgot password request for:', email);

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();
    console.log('Reset token saved for user:', email);

    await emailHelper.sendPasswordResetEmail(email, resetToken);
    console.log('Password reset email sent to:', email);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  console.log('Reset password request with token:', token);

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      console.log('Invalid or expired reset token:', token);
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    console.log('Password reset successfully for user:', user.email);
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

// Add a new function to refresh the token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const storedToken = await RefreshTokenModel.findOne({ where: { token: refreshToken } });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findByPk(storedToken.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate a new JWT token
    const newToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({ token: newToken });
  } catch (error) {
    console.error('Token refresh failed:', error);
    res.status(500).json({ message: 'Token refresh failed', error: error.message });
  }
};

// Add a logout function to invalidate the refresh token
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    await RefreshTokenModel.destroy({ where: { token: refreshToken } });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout failed:', error);
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

// Add this function to the existing authController.js file

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.user; // Get the user id from the authenticated request
    const { fullName, onboardingCompleted } = req.body; // Only allow updating these fields

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user
    if (fullName !== undefined) user.fullName = fullName;
    if (onboardingCompleted !== undefined) user.onboardingCompleted = onboardingCompleted;

    await user.save();

    // Return the updated user (excluding sensitive information)
    res.status(200).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      onboardingCompleted: user.onboardingCompleted
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};
