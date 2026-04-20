// src/services/autoNotifScheduler.js
const cron = require('node-cron');
const { checkAlertsAutomatically } = require('./autoNotif');

function startAutoNotifications() {
  console.log('Starting automated alerts (low stock + expiry)...');
  
  // Check immediately when server starts
  console.log('Running initial alerts check...');
  checkAlertsAutomatically();
  
  // // Schedule regular checks every 6 hours
  // cron.schedule('0 6,12,18,0 * * *', async () => {
  //   console.log('🕒 Scheduled alerts check running...');
  //   await checkAlertsAutomatically();
  // });

  console.log('Auto-alerts scheduled (every 6 hours)');
}

module.exports = { startAutoNotifications };