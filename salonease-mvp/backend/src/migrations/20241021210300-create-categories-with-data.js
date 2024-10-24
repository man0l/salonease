'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Categories', // refers to table name
          key: 'id', // refers to column name in Categories table
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Insert categories with hierarchy
    await queryInterface.bulkInsert('Categories', [
      { name: 'Фризьорски услуги', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Фризьор', parentId: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Дамско подстригване', parentId: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Мъжко подстригване', parentId: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Детско подстригване', parentId: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Прическа', parentId: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Изправяне', parentId: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Къдрене', parentId: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Боядисване', parentId: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Боядисване на мигли', parentId: 9, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Обезцветяване', parentId: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Екстеншъни', parentId: 1, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Маникюр и педикюр', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Маникюр', parentId: 13, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Декорации за нокти', parentId: 14, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Гел лак', parentId: 14, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Изграждане на нокти', parentId: 14, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Педикюр', parentId: 13, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Медицински педикюр', parentId: 18, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Козметични процедури за лице', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Почистване на лице', parentId: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Масаж на лице', parentId: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Терапии за лице', parentId: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Химически пилинг', parentId: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Микродермабразио', parentId: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Мезотерапия', parentId: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Йонофореза', parentId: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Ултразвукова терапия', parentId: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Дарсонвал', parentId: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'HIFU лифтинг', parentId: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Микроблейдинг', parentId: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Грим', parentId: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Гримьор', parentId: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Пилинг на лице', parentId: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Райкова терапия', parentId: 20, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Епилация', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Кола маска', parentId: 36, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Интимна кола маска', parentId: 37, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Лазерна епилация', parentId: 36, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Интимен лазер', parentId: 39, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Фотоепилация', parentId: 36, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Масажи', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Масаж', parentId: 42, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Дълбокотъканен масаж', parentId: 43, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Спортен масаж', parentId: 43, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Лимфодренаж', parentId: 43, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Ароматерапия', parentId: 43, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Релаксиращ масаж', parentId: 43, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Тяло и фигура', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Кавитация', parentId: 50, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Кератинова терапия', parentId: 50, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Парафинова терапия', parentId: 50, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Антицелулитен масаж', parentId: 50, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Специфични медицински и козметични услуги', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Облязване', parentId: 56, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Пиърсинг', parentId: 56, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Гъбичен нокът', parentId: 56, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Брадавици', parentId: 56, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Допълнителни услуги', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Йогурт пилинг', parentId: 61, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Украсяване', parentId: 61, createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Categories');
  }
};
