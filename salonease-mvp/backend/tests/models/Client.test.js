const { DataTypes } = require('sequelize');
const { sequelize, Client, Salon } = require('../setupTests');

describe('Client Model', () => {
  let salon;

  beforeEach(async () => {
    salon = await Salon.create({
      name: 'Test Salon',
      address: '123 Test St',
      contactNumber: '1234567890',
    });
  });

  it('should create a client with valid attributes', async () => {
    const client = await Client.create({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      salonId: salon.id,
    });

    expect(client.name).toBe('John Doe');
    expect(client.email).toBe('john@example.com');
    expect(client.phone).toBe('1234567890');
    expect(client.salonId).toBe(salon.id);

    const fetchedClient = await Client.findByPk(client.id);
    expect(fetchedClient).not.toBeNull();
  });

  it('should not create a client without a name', async () => {
    await expect(Client.create({
      email: 'john@example.com',
      phone: '1234567890',
      salonId: salon.id,
    })).rejects.toThrow();
  });

  it('should not create a client with an invalid phone number', async () => {
    await expect(Client.create({
      name: 'John Doe',
      email: 'john@example.com',
      phone: 'invalid-phone',
      salonId: salon.id,
    })).rejects.toThrow();
  });

  it('should associate a client with a salon', async () => {
    const client = await Client.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '0987654321',
      salonId: salon.id,
    });

    const clientWithSalon = await Client.findByPk(client.id, {
      include: [{ model: Salon, as: 'salon' }],
    });

    expect(clientWithSalon.salon).toBeDefined();
    expect(clientWithSalon.salon.id).toBe(salon.id);
  });
});
