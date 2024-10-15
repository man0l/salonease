const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailHelper = require('../utils/helpers/emailHelper');

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

    // Password strength validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log('Weak password:', password);
      return res.status(400).json({ message: 'Password must be at least 8 characters long and include uppercase letters, numbers, and special characters.' });
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
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful, token generated for user:', email);

    res.status(200).json({ token, user: { id: user.id, fullName: user.fullName, role: user.role } });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
