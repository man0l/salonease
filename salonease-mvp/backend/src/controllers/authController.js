const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, RefreshToken: RefreshTokenModel, sequelize } = require('../config/db');
const { Op } = require('sequelize');
const emailHelper = require('../utils/helpers/emailHelper');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const ROLES = require('../config/roles');
const SubscriptionService = require('../services/subscriptionService');
const subscriptionServiceInstance = new SubscriptionService();
const { uploadSingle, getImageUrl } = require('../utils/imageUpload');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in the environment variables');
  process.exit(1);
}

exports.register = async (req, res) => {
  try {
    const { error, value } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingUser = await User.findOne({ where: { email: value.email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);
    const newUser = await User.create({
      ...value,
      password: hashedPassword,
      role: ROLES.SALON_OWNER,
      onboardingCompleted: false,
      image: value.image || null
    });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await emailHelper.sendVerificationEmail(value.email, token);

    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Email verification failed:', error);
    res.status(400).json({ message: 'Invalid or expired token', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { error, value } = validateLogin({ email, password });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

    const refreshToken = uuidv4();
    await RefreshTokenModel.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

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

exports.me = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).json({ message: 'Error fetching user information', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    await emailHelper.sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const storedToken = await RefreshTokenModel.findOne({ 
      where: { token: refreshToken },
      include: [{ model: User, attributes: ['id', 'role'] }]
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    if (!storedToken.User) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newToken = jwt.sign(
      { userId: storedToken.User.id, role: storedToken.User.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    await storedToken.update({
      token: newRefreshToken,
      expiresAt: expiresAt
    });

    res.status(200).json({ 
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh failed:', error);
    if (error.name === 'SequelizeConnectionError') {
      return res.status(503).json({ message: 'Database connection error. Please try again later.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Failed to generate new token. Please log in again.' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Invalid data provided for token refresh.' });
    }
    res.status(500).json({ message: 'An unexpected error occurred while refreshing the token. Please try again.' });
  }
};

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

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.user;
    const { fullName, onboardingCompleted } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (onboardingCompleted !== undefined) user.onboardingCompleted = onboardingCompleted;
    if (req.file) {
      user.image = getImageUrl(req.file.filename, 'profiles');
    }

    await user.save();

    res.status(200).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      onboardingCompleted: user.onboardingCompleted,
      image: user.image
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

exports.completeOnboarding = async (req, res) => {
  try {   
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User information is required' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Start trial subscription
    await subscriptionServiceInstance.startTrialSubscription(user.id);    
    
    // Mark onboarding as completed
    await User.update({
      onboardingCompleted: true
    }, { 
      where: { id: user.id }
    });

    res.json({ message: 'Onboarding completed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
