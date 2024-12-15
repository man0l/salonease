const { Staff, Salon, User } = require('../config/db');
const { sendInvitationEmail, sendWelcomeEmail } = require("../utils/helpers/emailHelper");
const { validateInviteStaff } = require('../validators/staffValidator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ROLES = require('../config/roles');
const { uploadSingle, getImageUrl } = require('../utils/imageUpload');

exports.getStaff = async (req, res) => {
  const whereClause = {
    salonId: req.params.salonId
  }

  try {
    const staff = await Staff.findAll({
      where: whereClause,
      attributes: ['id', 'email', 'fullName', 'isActive', 'image'] // Explicitly specify the columns
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
};

exports.inviteStaff = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { error, value } = validateInviteStaff(req.body);
    
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.details.map(err => err.message) 
      });
    }

    const { email, fullName, image } = value;

    // Check if the inviter is trying to invite themselves
    if (req.user.email === email) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: ['You cannot invite yourself'] 
      });
    }

    // Check if a user with that email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: ['A user with this email already exists'] 
      });
    }

    // Check if a staff with that email already exists
    const existingStaff = await Staff.findOne({ where: { email } });
    if (existingStaff) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: ['A staff member with this email already exists'] 
      });
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
      image,
      invitationToken,
      isActive: false
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
    const { fullName } = req.body;

    // First verify the salon belongs to the current user
    const salon = await Salon.findOne({ 
      where: { 
        id: salonId, 
        ownerId: req.user.id 
      } 
    });

    if (!salon) {
      return res.status(403).json({ 
        message: 'You can only update staff in your own salon' 
      });
    }

    const staff = await Staff.findOne({
      where: { 
        id: staffId, 
        salonId 
      }
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    if (fullName) {
      staff.fullName = fullName;
    }
    
    if (req.file) {
      staff.image = getImageUrl(req.file.filename, 'profiles');
    }

    await staff.save();
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ 
      message: 'Error updating staff', 
      error: error.message 
    });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { salonId, staffId } = req.params;
    
    // Check if the salon belongs to the current user
    const salon = await Salon.findOne({ where: { id: salonId, ownerId: req.user.id } });
    if (!salon) {
      return res.status(403).json({ message: 'You can only delete staff from your own salon' });
    }

    // Find the staff member
    const staff = await Staff.findOne({ where: { id: staffId, salonId } });
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Delete the associated user if it exists
    if (staff.userId) {
      await User.destroy({ where: { id: staff.userId } });
    }

    // Delete the staff member
    await staff.destroy();

    res.json({ message: 'Staff and associated user deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
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
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ message: 'Invitation has expired' });
      }
      throw error;
    }

    // Create a new user account
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: staff.email,
      password: hashedPassword,
      fullName: staff.fullName,
      role: ROLES.STAFF,
      isEmailVerified: true
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
    console.error('Error accepting invitation:', error);
    res.status(500).json({ message: 'Error accepting invitation', error: error.message });
  }
};

exports.getAssociatedSalon = async (req, res) => {
  try {
    const staff = await Staff.findOne({
      where: { userId: req.user.id },
      include: [{
        model: Salon,
        as: 'salon',
        attributes: ['id', 'name', 'address', 'contactNumber']
      }]
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff record not found' });
    }

    if (!staff.salon) {
      return res.status(404).json({ message: 'Associated salon not found' });
    }

    res.json(staff.salon);
  } catch (error) {
    console.error('Error fetching associated salon:', error);
    res.status(500).json({ message: 'Error fetching associated salon', error: error.message });
  }
};
