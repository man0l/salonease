const { Salon } = require('../config/db');
const { validateSalon } = require('../validators/salonValidator');

exports.createSalon = async (req, res) => {
  try {
    const { error, value } = validateSalon(req.body);
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({ message: errorMessages.join(', ') });
    }

    const salon = await Salon.create({ ...value, ownerId: req.user.id });
    res.status(201).json(salon);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Error creating salon', error: error.message });
    }
  }
};

exports.getSalons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: salons } = await Salon.findAndCountAll({
      where: { ownerId: req.user.id },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      salons,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching salons', error: error.message });
  }
};

exports.updateSalon = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, contactNumber, description } = req.body;
    const salon = await Salon.findOne({ where: { id, ownerId: req.user.id } });
    
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    await salon.update({ name, address, contactNumber, description });
    res.status(200).json(salon);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Error updating salon', error: error.message });
    }
  }
};

exports.deleteSalon = async (req, res) => {
  try {
    const { id } = req.params;
    const salon = await Salon.findOne({ where: { id, ownerId: req.user.id } });
    
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    await salon.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting salon', error: error.message });
  }
};
