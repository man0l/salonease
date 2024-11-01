const { Client } = require('../config/db');
const { validateCreateClient, validateUpdateClient } = require('../validators/clientValidator');
const { Op } = require('sequelize');

exports.getClients = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { salonId };

    // Add search conditions if search parameter exists and has 3 or more characters
    if (search && search.length >= 3) {
      whereClause = {
        salonId,
        [Op.or]: [
          { 
            name: { 
              [Op.iLike]: `%${search.toLowerCase()}%` 
            } 
          },
          { 
            email: { 
              [Op.iLike]: `%${search.toLowerCase()}%` 
            } 
          },
          { 
            phone: { 
              [Op.like]: `%${search}%`  // phone numbers should be exact match
            } 
          }
        ]
      };
    }

    // Get total count of clients
    const totalCount = await Client.count({ where: whereClause });

    // Get paginated clients
    const clients = await Client.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Set total count header
    res.setHeader('x-total-count', totalCount.toString());
    res.json(clients);
  } catch (error) {
    console.error('Error in getClients:', error);
    res.status(500).json({ 
      message: 'Error fetching clients', 
      error: error.message 
    });
  }
};

exports.getClient = async (req, res) => {
  try {
    const { salonId, clientId } = req.params;
    const client = await Client.findOne({ where: { id: clientId, salonId } });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client', error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { salonId, clientId } = req.params;
    const { error, value } = validateUpdateClient(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const client = await Client.findOne({ where: { id: clientId, salonId } });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    await client.update(value);
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error updating client', error: error.message });
  }
};

exports.exportClients = async (req, res) => {
  try {
    const { salonId } = req.params;
    const clients = await Client.findAll({ where: { salonId } });
    // Convert clients to CSV format
    const csv = clients.map(client => `${client.name},${client.email},${client.phone || 'No phone number'}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=clients.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting clients', error: error.message });
  }
};

exports.addClient = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { error, value } = validateCreateClient(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Check if client with same email or phone exists in the salon
    const existingClient = await Client.findOne({
      where: {
        salonId,
        [Op.or]: [
          { email: value.email },
          { phone: value.phone }
        ]
      }
    });

    if (existingClient) {
      const duplicateField = existingClient.email === value.email ? 'email' : 'phone number';
      return res.status(409).json({
        message: `A client with this ${duplicateField} already exists in your salon`
      });
    }

    const newClient = await Client.create({ ...value, salonId });
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ message: 'Error adding client', error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { salonId, clientId } = req.params;
    
    const client = await Client.findOne({ 
      where: { 
        id: clientId, 
        salonId 
      } 
    });
    
    if (!client) {
      return res.status(404).json({ 
        message: 'Client not found',
        details: `No client found with ID ${clientId} in salon ${salonId}`
      });
    }

    await client.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client', error: error.message });
  }
};
