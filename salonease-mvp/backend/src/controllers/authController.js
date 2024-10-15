const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailHelper = require('../utils/helpers/emailHelper');

exports.register = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email is invalid' });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'SalonOwner',
    });

    // Generate an email verification token
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send verification email
    await emailHelper.sendVerificationEmail(email, token);

    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};
