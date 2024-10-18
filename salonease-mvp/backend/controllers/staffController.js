const Staff = require('../models/Staff');
const Salon = require('../models/Salon');
const { sendInvitationEmail } = require('../utils/emailHelper');

exports.getStaff = async (req, res) => {
  try {
    const { salonId } = req.params;
    const staff = await Staff.find({ salonId });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
};

exports.inviteStaff = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { email, fullName, role } = req.body;

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    const newStaff = new Staff({ salonId, email, fullName, role });
    await newStaff.save();

    // Send invitation email
    await sendInvitationEmail(email, fullName, salon.name);

    res.status(201).json(newStaff);
  } catch (error) {
    res.status(500).json({ message: 'Error inviting staff', error: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { salonId, staffId } = req.params;
    const updatedStaff = await Staff.findOneAndUpdate(
      { _id: staffId, salonId },
      req.body,
      { new: true }
    );
    if (!updatedStaff) {
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
    const deletedStaff = await Staff.findOneAndDelete({ _id: staffId, salonId });
    if (!deletedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting staff', error: error.message });
  }
};
