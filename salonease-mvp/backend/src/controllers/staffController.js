const { Staff, Salon, User } = require('../config/db');
const { sendInvitationEmail } = require("../utils/helpers/emailHelper");


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

    const salon = await Salon.findByPk(salonId);
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    const newStaff = await Staff.create({ salonId, email, fullName });

    // Send invitation email
    await sendInvitationEmail(email, fullName, salon.name);

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
