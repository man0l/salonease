const { Salon, SalonImage, sequelize } = require('../config/db');
const { validateCreateSalon, validateUpdateSalon } = require('../validators/salonValidator');
const { uploadMultiple, getImageUrl } = require('../utils/imageUpload');

exports.createSalon = async (req, res) => {
  const { error, value } = validateCreateSalon(req.body);
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({ message: 'Validation error', errors: errorMessages });
    }

  let transaction;
  try {
    transaction = await sequelize.transaction();

    const salon = await Salon.create({ ...value, ownerId: req.user.id }, { transaction });

    if (req.files && req.files.length > 0) {
      const salonImages = await Promise.all(req.files.map((file, index) => {
        return SalonImage.create({
          salonId: salon.id,
          imageUrl: getImageUrl(file.filename, 'salons'),
          caption: req.body.captions ? req.body.captions[index] : null,
          displayOrder: index
        }, { transaction });
      }));
      salon.dataValues.images = salonImages;
    }

    await transaction.commit();
    res.status(201).json(salon);
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error creating salon:', error);
    res.status(500).json({ message: 'Error creating salon', error: error.message });
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

  const { error, value } = validateUpdateSalon(req.body);
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({ message: 'Validation error', errors: errorMessages });
  }

  let transaction;
  try {
    transaction = await sequelize.transaction();

    const salon = await Salon.findOne({ 
      where: { 
        id: req.params.id, 
        ownerId: req.user.id 
      },
      transaction
    });
    
    if (!salon) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Salon not found' });
    }

    await salon.update(value, { transaction });

    if (req.files && req.files.length > 0) {
      await SalonImage.destroy({ 
        where: { salonId: salon.id },
        transaction 
      });
      
      const salonImages = await Promise.all(req.files.map((file, index) => {
        return SalonImage.create({
          salonId: salon.id,
          imageUrl: getImageUrl(file.filename, 'salons'),
          caption: req.body.captions ? req.body.captions[index] : null,
          displayOrder: index
        }, { transaction });
      }));
      salon.dataValues.images = salonImages;
    }

    await transaction.commit();
    res.status(200).json(salon);
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: 'Error updating salon', error: error.message });
  }
};

exports.deleteSalon = async (req, res) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const { id } = req.params;
    const { force } = req.query;
    
    const salon = await Salon.findOne({ 
      where: { id, ownerId: req.user.id },
      paranoid: false,
      transaction
    });
    
    if (!salon) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Salon not found' });
    }

    await salon.destroy({ force: force === 'true', transaction });
    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: 'Error deleting salon', error: error.message });
  }
};

// Add restore endpoint
exports.restoreSalon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const salon = await Salon.findOne({ 
      where: { id, ownerId: req.user.id },
      paranoid: false // Required to find soft-deleted salons
    });
    
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    await salon.restore();
    res.status(200).json(salon);
  } catch (error) {
    console.error('Error restoring salon:', error);
    res.status(500).json({ message: 'Error restoring salon', error: error.message });
  }
};
