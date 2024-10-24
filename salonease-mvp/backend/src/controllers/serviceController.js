const { Service, Salon, Category } = require('../config/db');
const { validateCreateService, validateUpdateService } = require('../validators/serviceValidator');

exports.createService = async (req, res) => {
  try {
    const { error, value } = validateCreateService(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Check if the category exists
    const category = await Category.findByPk(value.categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const service = await Service.create({ ...value, salonId: req.params.salonId });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error creating service', error: error.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { salonId: req.params.salonId },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { error, value } = validateUpdateService(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (value.categoryId) {
      const category = await Category.findByPk(value.categoryId);
      if (!category) return res.status(400).json({ message: 'Invalid category' });
    }

    await service.update(value);
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error updating service', error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    await service.destroy();
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service', error: error.message });
  }
};
