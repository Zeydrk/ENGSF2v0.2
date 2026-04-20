'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Packages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      seller_Id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references: {
        model: "Sellers", 
        key: "id"
      },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    },
      package_Name: {
        type: Sequelize.STRING
      },
      recipient_Name: {
        type: Sequelize.STRING
      },
      descrtion: {
        type: Sequelize.STRING
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Packages');
  }
};