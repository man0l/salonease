const { DataTypes } = require('sequelize');
const { sequelize, Staff, Salon, User } = require('../setupTests');

describe('Staff Model', () => {

  it('should create a staff member with valid attributes', async () => {
    const owner = await User.create({
        fullName: 'Salon Owner',
        email: 'owner@example.com',
        password: 'Password123!'
    });

    const salon = await Salon.create({
        name: 'Test Salon',
        address: '123 Test St',
        contactNumber: '1234567890',
        ownerId: owner.id
    });
  
    const staff = await Staff.create({
      email: 'staff@example.com',
      fullName: 'Staff Member',
      salonId: salon.id
    });

    expect(staff.email).toBe('staff@example.com');
    expect(staff.fullName).toBe('Staff Member');
    expect(staff.salonId).toBe(salon.id);
    expect(staff.isActive).toBe(true);

    const fetchedStaff = await Staff.findByPk(staff.id);
    expect(fetchedStaff).not.toBeNull();
  });

  it('should not create a staff member with invalid email', async () => {
    const owner = await User.create({
        fullName: 'Salon Owner',
        email: 'owner@example.com',
        password: 'Password123!'
    });

    const salon = await Salon.create({
        name: 'Test Salon',
        address: '123 Test St',
        contactNumber: '1234567890',
        ownerId: owner.id
    });

    await expect(Staff.create({
      email: 'invalid-email',
      fullName: 'Invalid Email Staff',
      salonId: salon.id
    })).rejects.toThrow();
  });

  it('should create an inactive staff member', async () => {
    const owner = await User.create({
        fullName: 'Salon Owner',
        email: 'owner@example.com',
        password: 'Password123!'
    });

    const salon = await Salon.create({
        name: 'Test Salon',
        address: '123 Test St',
        contactNumber: '1234567890',
        ownerId: owner.id
    });

    const inactiveStaff = await Staff.create({
      email: 'inactive@example.com',
      fullName: 'Inactive Staff',
      salonId: salon.id,
      isActive: false
    });    

    expect(inactiveStaff.isActive).toBe(false);
  });

  it('should associate a staff member with a salon', async () => {
    const owner = await User.create({
        fullName: 'Salon Owner',
        email: 'owner@example.com',
        password: 'Password123!'
    });

    const salon = await Salon.create({
        name: 'Test Salon',
        address: '123 Test St',
        contactNumber: '1234567890',
        ownerId: owner.id
    });

    const staff = await Staff.create({
      email: 'salonstaff@example.com',
      fullName: 'Salon Staff',
      salonId: salon.id
    });

    const staffWithSalon = await Staff.findByPk(staff.id, {
      include: [{ model: Salon, as: 'salon' }]
    });

    expect(staffWithSalon.salon).toBeDefined();
    expect(staffWithSalon.salon.id).toBe(salon.id);
  });
});
