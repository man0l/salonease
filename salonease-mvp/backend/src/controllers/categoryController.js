const { Category } = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Category, as: 'children' }]
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};
