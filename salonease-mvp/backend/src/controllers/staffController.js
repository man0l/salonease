const { Staff, Salon, User } = require('../config/db');
const { sendInvitationEmail, sendWelcomeEmail } = require("../utils/helpers/emailHelper");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getStaff = async (req, res) => {
  try {
    const { salonId } = req.params;
    const staff = await Staff.findAll({
      where: { salonId },
      attributes: ['id', 'email', 'fullName', 'isActive'] // Explicitly specify the columns
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
};

exports.inviteStaff = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { email, fullName } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Validation error', errors: ['Invalid email format'] });
    }

    // Validate fullName
    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({ message: 'Validation error', errors: ['Full name is required'] });
    }

    // Check if the inviter is trying to invite themselves
    if (req.user.email === email) {
      return res.status(400).json({ message: 'Validation error', errors: ['You cannot invite yourself'] });
    }

    // Check if a user with that email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Validation error', errors: ['A user with this email already exists'] });
    }

    // Check if a staff with that email already exists
    const existingStaff = await Staff.findOne({ where: { email } });
    if (existingStaff) {
      return res.status(400).json({ message: 'Validation error', errors: ['A staff member with this email already exists'] });
    }



    const salon = await Salon.findByPk(salonId);
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    // Generate invitation token
    const invitationToken = jwt.sign(
      { email, salonId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    const newStaff = await Staff.create({ 
      salonId, 
      email, 
      fullName, 
      invitationToken 
    });

    // Send invitation email with the token
    await sendInvitationEmail(email, fullName, salon.name, invitationToken);

    res.status(201).json(newStaff);
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    console.error('Error inviting staff:', error);
    res.status(500).json({ message: 'Error inviting staff', error: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { salonId, staffId } = req.params;
    const { fullName, isActive } = req.body; // Only allow updating these fields
    const [updatedRowsCount, [updatedStaff]] = await Staff.update(
      { fullName, isActive },
      {
        where: { id: staffId, salonId },
        returning: true,
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json(updatedStaff);
  } catch (error) {
    res.status(500).json({ message: 'Error updating staff', error: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { salonId, staffId } = req.params;
    const deletedRowsCount = await Staff.destroy({ where: { id: staffId, salonId } });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting staff', error: error.message });
  }
};

exports.acceptInvitation = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find the staff member by invitation token
    const staff = await Staff.findOne({ where: { invitationToken: token } });
    if (!staff) {
      return res.status(404).json({ message: 'Invalid invitation' });
    }

    // Check if the invitation has expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (Date.now() >= decoded.exp * 1000) {
      return res.status(400).json({ message: 'Invitation has expired' });
    }

    // Create a new user account
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: staff.email,
      password: hashedPassword,
      fullName: staff.fullName,
      role: 'staff'
    });

    // Update the staff record with the new user ID
    await staff.update({ userId: user.id, isActive: true });

    // Find the salon
    const salon = await Salon.findByPk(staff.salonId);

    // Send welcome email
    await sendWelcomeEmail(staff.email, staff.fullName, salon.name);

    // Clear the invitation token after successful acceptance
    await staff.update({ invitationToken: null, isActive: true });

    res.status(200).json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }
    console.error('Error accepting invitation:', error);
    res.status(500).json({ message: 'Error accepting invitation', error: error.message });
  }
};
