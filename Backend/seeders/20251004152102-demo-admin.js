// seeders/20251126160001-demo-admins.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Admins', [
      {
        email: 'admin@rms.com',
        password: 'admin123', // Note: In production, this should be hashed
       
      },
      {
        email: 'super.admin@rms.com',
        password: 'super123',
        
      },
      {
        email: 'inventory.admin@rms.com',
        password: 'inventory123',
        
      },
      {
        email: 'store.manager@rms.com',
        password: 'manager123',
        
      },
      {
        email: 'system.admin@rms.com',
        password: 'system123',
        
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Admins', null, {});
  }
};