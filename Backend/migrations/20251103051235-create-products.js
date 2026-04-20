'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_Name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      product_Description: {
        type: Sequelize.TEXT
      },
      product_RetailPrice: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      product_BuyingPrice: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
      },
      product_Stock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      product_Expiry: {
        type: Sequelize.DATE,
        allowNull: true
      },
      product_Category:{
          type: Sequelize.STRING,
          allowNull: false

          // references:{ 
          //   model: 'Categories',
          //   key: 'id'
          // },
          // onDelete:'RESTRICT',
          // onUpdate: 'CASCADE'
      },
      product_QrCodeValue:{ 
        type: Sequelize.STRING
      },
      product_QrCodePath: {
        type: Sequelize.STRING
      },
      isArchived:{
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};