const { DataTypes } = require('sequelize');
const { sequelize, Category } = require('../setupTests');

describe('Category Model', () => {
  it('should create a category with valid attributes', async () => {
    const category = await Category.create({
      name: 'Hair Services',
    });

    expect(category.name).toBe('Hair Services');

    const fetchedCategory = await Category.findByPk(category.id);
    expect(fetchedCategory).not.toBeNull();
  });

  it('should not create a category without a name', async () => {
    await expect(Category.create({})).rejects.toThrow();
  });

  it('should create a subcategory', async () => {
    const parentCategory = await Category.create({
      name: 'Hair Services',
    });

    const subcategory = await Category.create({
      name: 'Coloring',
      parentId: parentCategory.id,
    });

    expect(subcategory.parentId).toBe(parentCategory.id);

    const fetchedSubcategory = await Category.findByPk(subcategory.id, {
      include: [{ model: Category, as: 'parent' }],
    });

    expect(fetchedSubcategory.parent).toBeDefined();
    expect(fetchedSubcategory.parent.id).toBe(parentCategory.id);
  });

  it('should get all subcategories of a parent category', async () => {
    const parentCategory = await Category.create({
      name: 'Hair Services',
    });

    await Category.bulkCreate([
      { name: 'Coloring', parentId: parentCategory.id },
      { name: 'Styling', parentId: parentCategory.id },
    ]);

    const fetchedParentCategory = await Category.findByPk(parentCategory.id, {
      include: [{ model: Category, as: 'children' }],
    });

    expect(fetchedParentCategory.children).toHaveLength(2);
    expect(fetchedParentCategory.children[0].name).toBe('Coloring');
    expect(fetchedParentCategory.children[1].name).toBe('Styling');
  });
});
