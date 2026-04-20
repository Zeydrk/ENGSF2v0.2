'use strict';

/** @type {import('sequelize-cli').Migration} */ 
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sellers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      seller_Name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      seller_Email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      seller_Phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      balance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sellers');
  }
};
