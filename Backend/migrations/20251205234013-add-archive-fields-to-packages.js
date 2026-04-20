'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add archive-related columns to Packages table
    await queryInterface.addColumn('Packages', 'isArchived', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    
    await queryInterface.addColumn('Packages', 'archivedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('Packages', 'archiveReason', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    // You can add other altering commands here if needed
    // Example:
    // await queryInterface.createTable('users', { id: Sequelize.INTEGER });
  },

  async down(queryInterface, Sequelize) {
    // Remove the archive-related columns
    await queryInterface.removeColumn('Packages', 'isArchived');
    await queryInterface.removeColumn('Packages', 'archivedAt');
    await queryInterface.removeColumn('Packages', 'archiveReason');
    
    // You can add other reverting commands here if needed
    // Example:
    // await queryInterface.dropTable('users');
  }
};