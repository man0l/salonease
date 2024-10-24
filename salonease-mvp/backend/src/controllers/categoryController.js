const { Category } = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    const structuredCategories = structureCategories(categories);
    res.json(structuredCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

function structureCategories(categories) {
  const categoryMap = new Map();
  const rootCategories = [];

  // First pass: create a map of all categories
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category.toJSON(), children: [] });
  });

  // Second pass: structure the categories
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id);
    if (category.parentId === null || category.parentId === category.id) {
      rootCategories.push(categoryWithChildren);
    } else {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(categoryWithChildren);
      } else {
        rootCategories.push(categoryWithChildren);
      }
    }
  });

  // Add sorting of categories
  return sortCategories(rootCategories);
}

function sortCategories(categories) {
  return categories.sort((a, b) => a.name.localeCompare(b.name)).map(category => ({
    ...category,
    children: category.children.length > 0 ? sortCategories(category.children) : []
  }));
}
