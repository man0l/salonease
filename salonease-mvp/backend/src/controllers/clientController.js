const { Client } = require('../config/db');

exports.getClients = async (req, res) => {
  try {
    const { salonId } = req.params;
    const clients = await Client.findAll({ where: { salonId } });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error: error.message });
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
    const { name, email, phone, notes } = req.body;
    const client = await Client.findOne({ where: { id: clientId, salonId } });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    await client.update({ name, email, phone, notes });
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
