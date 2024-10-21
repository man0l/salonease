const { StaffAvailability, Staff, Salon } = require('../config/db');
const { Op } = require('sequelize');

exports.getStaffAvailability = async (req, res) => {
  try {
    const { salonId } = req.params;
    const availability = await StaffAvailability.findAll({
      where: { salonId },
      include: [{ model: Staff, as: 'staff', attributes: ['id', 'fullName'] }]
    });
    res.json(availability);
  } catch (error) {
    console.error('Error fetching staff availability:', error);
    res.status(500).json({ message: 'Error fetching staff availability', error: error.message });
  }
};

exports.createOrUpdateStaffAvailability = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { staffId, dayOfWeek, startTime, endTime, type } = req.body;
    const availabilityId = req.params.availabilityId;

    // Validate input
    if (!staffId || dayOfWeek === undefined || !startTime || !endTime || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if staff belongs to the salon
    const staff = await Staff.findOne({ where: { id: staffId, salonId } });
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found in this salon' });
    }

    // Check for overlapping availabilities
    const overlappingAvailabilities = await StaffAvailability.findAll({
      where: {
        staffId,
        salonId,
        dayOfWeek,
        [Op.or]: [
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime }
          },
          {
            startTime: { [Op.gte]: startTime, [Op.lt]: endTime }
          },
          {
            endTime: { [Op.gt]: startTime, [Op.lte]: endTime }
          }
        ]
      }
    });

    // If updating, filter out the current availability from overlapping checks
    const conflictingAvailabilities = availabilityId
      ? overlappingAvailabilities.filter(a => a.id !== availabilityId)
      : overlappingAvailabilities;

    if (conflictingAvailabilities.length > 0) {
      return res.status(400).json({ message: 'Overlapping availability exists' });
    }

    // Create or update availability
    let availability;
    if (availabilityId) {
      // Update existing availability
      availability = await StaffAvailability.findOne({
        where: { id: availabilityId, staffId, salonId }
      });
      if (!availability) {
        return res.status(404).json({ message: 'Availability not found' });
      }
      await availability.update({ startTime, endTime, type });
    } else {
      // Create new availability
      availability = await StaffAvailability.create({
        staffId, salonId, dayOfWeek, startTime, endTime, type
      });
    }

    res.status(availabilityId ? 200 : 201).json(availability);
  } catch (error) {
    console.error('Error creating/updating staff availability:', error);
    res.status(500).json({ message: 'Error creating/updating staff availability', error: error.message });
  }
};

exports.deleteStaffAvailability = async (req, res) => {
  try {
    const { salonId, availabilityId } = req.params;
    const deleted = await StaffAvailability.destroy({
      where: { id: availabilityId, salonId }
    });

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Availability not found' });
    }
  } catch (error) {
    console.error('Error deleting staff availability:', error);
    res.status(500).json({ message: 'Error deleting staff availability', error: error.message });
  }
};
