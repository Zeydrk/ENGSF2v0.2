'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AdminLogActivities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      adminId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Admins',
          key: 'id'
        }
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      actionDetails: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Products',
          key: 'id'
        }
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AdminLogActivities');
  }
};