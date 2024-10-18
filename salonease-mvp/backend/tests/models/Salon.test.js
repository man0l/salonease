const { DataTypes } = require('sequelize');
const { sequelize, Salon, User } = require('../setupTests');

describe('Salon Model', () => {
  let createdSalons = [];
  let owner;

  beforeAll(async () => {
    owner = await User.create({
      fullName: 'Salon Owner',
      email: 'owner@example.com',
      password: 'Password123!'
    });
  });

  afterEach(async () => {
    for (const salon of createdSalons) {
      await Salon.destroy({ where: { id: salon.id } });
    }
    createdSalons = [];
  });

  it('should create a salon with valid attributes', async () => {
    const salon = await Salon.create({
      name: 'Test Salon',
      address: '123 Test St',
      contactNumber: '1234567890',
      ownerId: owner.id
    });
    createdSalons.push(salon);

    expect(salon.name).toBe('Test Salon');
    expect(salon.address).toBe('123 Test St');
    expect(salon.contactNumber).toBe('1234567890');
    expect(salon.ownerId).toBe(owner.id);

    const fetchedSalon = await Salon.findByPk(salon.id);
    expect(fetchedSalon).not.toBeNull();
  });

  it('should not create a salon without required fields', async () => {
    await expect(Salon.create({
      name: 'Incomplete Salon'
    })).rejects.toThrow();
  });

  it('should associate a salon with an owner', async () => {
    const salon = await Salon.create({
      name: 'Owned Salon',
      address: '456 Owner St',
      contactNumber: '9876543210',
      ownerId: owner.id
    });
    createdSalons.push(salon);

    const salonWithOwner = await Salon.findByPk(salon.id, {
      include: [{ model: User, as: 'owner' }]
    });

    expect(salonWithOwner.owner).toBeDefined();
    expect(salonWithOwner.owner.id).toBe(owner.id);
  });
});
