const { validateCreateBooking } = require('../validators/bookingValidator');
const { Salon, Service, Staff, Category, Booking, Client } = require('../config/db');
const { Op } = require('sequelize');
const BOOKING_STATUSES = require('../config/bookingStatuses');
const sequelize = require('../config/db').sequelize;

exports.getSalonPublicProfile = async (req, res) => {
  try {
    const salon = await Salon.findByPk(req.params.salonId, {
      attributes: ['id', 'name', 'address', 'contactNumber', 'description']
    });
    
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    res.json(salon);
  } catch (error) {
    console.error('Error fetching salon profile:', error);
    res.status(500).json({ message: 'Error fetching salon profile' });
  }
};

exports.getSalonPublicServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { salonId: req.params.salonId },
      attributes: ['id', 'name', 'description', 'price', 'duration'],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'parentId'],
        include: [{
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'parentId'],
          include: [{
            model: Category,
            as: 'parent',
            attributes: ['id', 'name', 'parentId']
          }]
        }]
      }],
      order: [
        [{ model: Category, as: 'category' }, 'name', 'ASC'],
        ['name', 'ASC']
      ]
    });

    // Process services to include full category hierarchy
    const processedServices = services.map(service => {
      const serviceData = service.toJSON();
      
      // Build category chain
      if (serviceData.category) {
        let currentCategory = serviceData.category;
        const categoryChain = [currentCategory];
        
        // Traverse up the category tree
        while (currentCategory.parent) {
          currentCategory = currentCategory.parent;
          categoryChain.unshift(currentCategory);
        }

        // Replace category data with the full chain
        serviceData.categoryHierarchy = categoryChain.map(cat => ({
          id: cat.id,
          name: cat.name,
          parentId: cat.parentId
        }));

        // Keep the direct category for backward compatibility
        serviceData.category = {
          id: serviceData.category.id,
          name: serviceData.category.name,
          parentId: serviceData.category.parentId,
          parent: serviceData.category.parent
        };
      }

      return serviceData;
    });
    
    res.json(processedServices);
  } catch (error) {
    console.error('Error fetching salon services:', error);
    res.status(500).json({ message: 'Error fetching salon services' });
  }
};

exports.getSalonPublicStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({
      where: { salonId: req.params.salonId },
      attributes: ['id', 'fullName', 'isActive']
    });

    res.json(staff);
  } catch (error) {
    console.error('Error fetching salon staff:', error);
    res.status(500).json({ message: 'Error fetching salon staff' });
  }
};

exports.getSalonServiceCategories = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { salonId: req.params.salonId },
      attributes: ['id', 'categoryId'],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'parentId'],
        include: [{
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'parentId']
        }]
      }]
    });

    // Create a hierarchical structure
    const hierarchy = {};

    // Process each service's category chain
    for (const service of services) {
      if (!service.category) continue;

      const currentCategory = service.category;
      const parentCategory = currentCategory.parent;

      // If this is a root category (no parent)
      if (!currentCategory.parentId) {
        if (!hierarchy[currentCategory.id]) {
          hierarchy[currentCategory.id] = {
            id: currentCategory.id,
            name: currentCategory.name,
            subcategories: {}
          };
        }
        continue;
      }

      // If this is a second-level category
      if (parentCategory && !parentCategory.parentId) {
        // Initialize parent if it doesn't exist
        if (!hierarchy[parentCategory.id]) {
          hierarchy[parentCategory.id] = {
            id: parentCategory.id,
            name: parentCategory.name,
            subcategories: {}
          };
        }

        // Add current category under parent
        if (!hierarchy[parentCategory.id].subcategories[currentCategory.id]) {
          hierarchy[parentCategory.id].subcategories[currentCategory.id] = {
            id: currentCategory.id,
            name: currentCategory.name,
            subcategories: {}
          };
        }
        continue;
      }

      // If this is a third-level category
      if (parentCategory) {
        const grandParentId = parentCategory.parentId;
        if (!hierarchy[grandParentId]) {
          // Initialize grand parent
          hierarchy[grandParentId] = {
            id: grandParentId,
            name: parentCategory.parent?.name || 'Unknown',
            subcategories: {}
          };
        }

        // Initialize parent under grand parent
        if (!hierarchy[grandParentId].subcategories[parentCategory.id]) {
          hierarchy[grandParentId].subcategories[parentCategory.id] = {
            id: parentCategory.id,
            name: parentCategory.name,
            subcategories: {}
          };
        }

        // Add current category
        hierarchy[grandParentId].subcategories[parentCategory.id].subcategories[currentCategory.id] = {
          id: currentCategory.id,
          name: currentCategory.name
        };
      }
    }

    // Transform the hierarchy object into an array
    const result = Object.values(hierarchy).map(category => ({
      ...category,
      subcategories: Object.values(category.subcategories).map(subcat => ({
        ...subcat,
        subcategories: Object.values(subcat.subcategories)
      }))
    }));

    res.json({ categories: result });
  } catch (error) {
    console.error('Error fetching salon service categories:', error);
    res.status(500).json({ message: 'Error fetching salon service categories' });
  }
};

exports.checkSalonAvailability = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { date, staffId } = req.query;

    // Validate date
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const roundToNextFifteen = (date) => {
      const minutes = date.getMinutes();
      const remainder = minutes % 15;
      const roundedMinutes = minutes + (15 - remainder);
      const roundedDate = new Date(date);
      roundedDate.setMinutes(roundedMinutes);
      roundedDate.setSeconds(0);
      roundedDate.setMilliseconds(0);
      
      if (roundedMinutes >= 60) {
        roundedDate.setHours(roundedDate.getHours() + 1);
        roundedDate.setMinutes(0);
      }
      
      return roundedDate;
    };

    // Get salon's operating hours
    const startHour = 9;
    const endHour = 20;

    // Get all bookings for the selected date with their associated services
    const existingBookings = await Booking.findAll({
      where: {
        salonId,
        appointmentDateTime: {
          [Op.between]: [
            new Date(selectedDate.setHours(startHour, 0, 0)),
            new Date(selectedDate.setHours(endHour, 0, 0))
          ]
        },
        ...(staffId && { staffId }),
        status: {
          [Op.notIn]: ['CANCELLED', 'COMPLETED']
        }
      },
      attributes: ['appointmentDateTime'],
      include: [{
        model: Service,
        as: 'service',
        attributes: ['duration'],
        required: true
      }]
    });

    // Generate all possible 15-minute slots
    const availableSlots = [];
    const currentDate = new Date();
    const roundedCurrentTime = roundToNextFifteen(currentDate);
    
    // If selected date is today, start from rounded current time
    // Otherwise, start from salon opening time
    let startTime = selectedDate.toDateString() === currentDate.toDateString() 
      ? Math.max(roundedCurrentTime.getHours(), startHour)
      : startHour;

    for (let hour = startTime; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hour, minute, 0, 0);

        // Skip slots before rounded current time for today
        if (selectedDate.toDateString() === currentDate.toDateString() && 
            slotTime < roundedCurrentTime) {
          continue;
        }

        // Check if slot conflicts with any existing booking
        const isSlotAvailable = !existingBookings.some(booking => {
          const bookingStart = new Date(booking.appointmentDateTime);
          const bookingEnd = new Date(bookingStart.getTime() + (booking.service.duration * 60000));
          return slotTime >= bookingStart && slotTime < bookingEnd;
        });

        if (isSlotAvailable) {
          availableSlots.push(
            `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          );
        }
      }
    }

    res.json({ availableSlots });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Error checking availability' });
  }
};

exports.createPublicBooking = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { salonId } = req.params;
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      serviceId, 
      staffId, 
      appointmentDateTime,
      notes 
    } = req.body;

    // Validate using bookingValidator
    const { error, value } = validateCreateBooking({
      clientName,
      clientEmail,
      clientPhone,
      serviceId,
      staffId,
      appointmentDateTime,
      notes
    });

    if (error) {
      await transaction.rollback();
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errorMessages 
      });
    }

    // Find or create client
    const [client] = await Client.findOrCreate({
      where: { 
        email: clientEmail,
        salonId 
      },
      defaults: {
        name: clientName,
        phone: clientPhone,
        salonId
      },
      transaction
    });

    // Check if staff belongs to salon
    const staff = await Staff.findOne({ 
      where: { id: staffId, salonId },
      transaction
    });
    if (!staff) {
      await transaction.rollback();
      return res.status(404).json({ 
        message: 'Staff not found in this salon' 
      });
    }

    // Get service and validate it belongs to salon
    const service = await Service.findOne({ 
      where: { id: serviceId, salonId },
      transaction
    });
    if (!service) {
      await transaction.rollback();
      return res.status(404).json({ 
        message: 'Service not found in this salon' 
      });
    }

    // Calculate appointment end time
    const appointmentDate = new Date(appointmentDateTime);
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      where: {
        staffId,
        status: [BOOKING_STATUSES.PENDING, BOOKING_STATUSES.CONFIRMED],
        [Op.or]: [
          {
            appointmentDateTime: {
              [Op.gte]: appointmentDateTime,
              [Op.lt]: endTime
            }
          },
          {
            endTime: {
              [Op.gt]: appointmentDateTime,
              [Op.lte]: endTime
            }
          }
        ]
      },
      transaction
    });

    if (conflictingBooking) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Time slot is not available' 
      });
    }

    // Create the booking using validated data
    const booking = await Booking.create({
      salonId,
      clientId: client.id,
      serviceId: value.serviceId,
      staffId: value.staffId,
      appointmentDateTime: value.appointmentDateTime,
      endTime,
      notes: value.notes,
      status: BOOKING_STATUSES.PENDING
    }, { transaction });

    await transaction.commit();

    // Return success response with booking details
    res.status(201).json({
      booking: {
        id: booking.id,
        appointmentDateTime: booking.appointmentDateTime,
        endTime: booking.endTime,
        status: booking.status,
        service: {
          name: service.name,
          duration: service.duration,
          price: service.price
        },
        staff: {
          name: staff.fullName
        },
        client: {
          name: client.name,
          email: client.email,
          phone: client.phone
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating public booking:', error);
    res.status(500).json({ 
      message: 'Error creating booking', 
      error: error.message 
    });
  }
}; 