// seeders/20251126160000-demo-accounts.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Accounts', [
      {
        email: 'admin@rms.com',
        password: 'admin123', // Note: In production, this should be hashed
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Accounts', null, {});
  }
};