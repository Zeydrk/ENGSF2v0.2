'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // Remove old columns
    await queryInterface.removeColumn('Packages', 'package_Name');
    await queryInterface.removeColumn('Packages', 'recipient_Name');
    await queryInterface.removeColumn('Packages', 'descrtion');

    // Add new columns
    await queryInterface.addColumn('Packages', 'package_Name', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'buyer_Name', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'dropOff_Date', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'package_Size', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'price', {
      type: Sequelize.DECIMAL(10,2),
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'handling_Fee', {
      type: Sequelize.DECIMAL(10,2),
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'payment_Status', {
      type: Sequelize.STRING, // paid / unpaid
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'payment_Method', {
      type: Sequelize.STRING, // cash / gcash
      allowNull: false,
    });

    await queryInterface.addColumn('Packages', 'package_Status', {
      type: Sequelize.STRING, // claimed / unclaimed
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    // Revert new columns
    await queryInterface.removeColumn('Packages', 'package_Name');
    await queryInterface.removeColumn('Packages', 'buyer_Name');
    await queryInterface.removeColumn('Packages', 'dropOff_Date');
    await queryInterface.removeColumn('Packages', 'package_Size');
    await queryInterface.removeColumn('Packages', 'price');
    await queryInterface.removeColumn('Packages', 'handling_Fee');
    await queryInterface.removeColumn('Packages', 'payment_Status');
    await queryInterface.removeColumn('Packages', 'payment_Method');
    await queryInterface.removeColumn('Packages', 'package_Status');

    // Restore original columns
    await queryInterface.addColumn('Packages', 'package_Name', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('Packages', 'recipient_Name', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('Packages', 'descrtion', {
      type: Sequelize.STRING
    });
  }
};
