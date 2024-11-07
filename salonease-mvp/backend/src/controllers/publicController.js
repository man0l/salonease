const { Salon, Service, Staff, Category } = require('../config/db');
const { Op } = require('sequelize');

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
          attributes: ['id', 'name', 'parentId']
        }]
      }],
      order: [
        [{ model: Category, as: 'category' }, 'name', 'ASC'],
        ['name', 'ASC']
      ]
    });

    // Log the structure before sending
    console.log('Services with categories:', JSON.stringify(services, null, 2));

    res.json(services);
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