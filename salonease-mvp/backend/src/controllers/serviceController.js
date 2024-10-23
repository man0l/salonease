const { Service, Salon } = require('../config/db');
const { validateService } = require('../validators/serviceValidator');

exports.createService = async (req, res) => {
  try {
    const { error, value } = validateService(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const service = await Service.create({ ...value, salonId: req.params.salonId });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error creating service', error: error.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.findAll({ where: { salonId: req.params.salonId } });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { error, value } = validateService(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Remove id from value if it exists to prevent overwriting
    const { id, ...updateData } = value;

    await service.update(updateData);
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
