const { Model, DataTypes } = require('sequelize');

class Category extends Model {
  static associate(models) {
    this.belongsTo(models.Category, { 
      foreignKey: 'parentId', 
      as: 'parent',
      onDelete: 'CASCADE'
    });
    this.hasMany(models.Category, { 
      foreignKey: 'parentId', 
      as: 'children' 
    });
  }
}

module.exports = (sequelize) => {
  Category.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Category',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Category',
  });

  return Category;
};
