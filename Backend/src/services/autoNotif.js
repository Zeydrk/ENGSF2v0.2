const { sendLowStockNotification, sendExpiringSoonNotification, sendCombinedAlert } = require('./emailNotif');
const models = require('../../models');

// Track last notification to avoid spamming
let lastNotificationTime = null;
const NOTIFICATION_COOLDOWN = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

async function checkAlertsAutomatically() {
  try {
    console.log('🤖 Auto-checking for alerts...');
    
    const products = await models.Products.findAll();
    const now = new Date();
    
    // Check for low stock products
    const lowStockProducts = products.filter(product => 
      product.product_Stock < 10
    );

    // Check for expiring soon products (within 3 days)
    const expiringProducts = products.filter(product => {
      if (!product.product_Expiry) return false;
      const expiryDate = new Date(product.product_Expiry);
      const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      return daysRemaining <= 3 && daysRemaining >= 0;
    });

    console.log(`📊 Found ${lowStockProducts.length} low stock, ${expiringProducts.length} expiring products`);

    // Don't send notification if no alerts
    if (lowStockProducts.length === 0 && expiringProducts.length === 0) {
      return { sent: false, reason: 'No alerts' };
    }

    // Check if we recently sent a notification (avoid spamming)
    if (lastNotificationTime && (now - lastNotificationTime) < NOTIFICATION_COOLDOWN) {
      console.log('⏰ Skipping notification - too soon since last one');
      return { sent: false, reason: 'Cooldown period' };
    }

    // Send appropriate notification
    let emailResult;
    
    if (lowStockProducts.length > 0 && expiringProducts.length > 0) {
      // Both types of alerts
      emailResult = await sendCombinedAlert(lowStockProducts, expiringProducts);
    } else if (lowStockProducts.length > 0) {
      // Only low stock
      emailResult = await sendLowStockNotification(lowStockProducts);
    } else {
      // Only expiring
      emailResult = await sendExpiringSoonNotification(expiringProducts);
    }
    
    if (emailResult.success) {
      lastNotificationTime = now;
      console.log('Auto-notification sent successfully');
    }

    return {
      sent: emailResult.success,
      lowStockCount: lowStockProducts.length,
      expiringCount: expiringProducts.length,
      products: {
        lowStock: lowStockProducts.map(p => p.product_Name),
        expiring: expiringProducts.map(p => p.product_Name)
      }
    };

  } catch (error) {
    console.error('Error in auto alerts check:', error);
    return { sent: false, error: error.message };
  }
}

module.exports = { checkAlertsAutomatically };