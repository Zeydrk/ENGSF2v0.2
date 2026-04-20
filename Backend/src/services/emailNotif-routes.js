const express = require('express');
const router = express.Router();
const { sendLowStockNotification } = require('./emailNotif');
const models = require('../../models');

router.post('/low-stock-alert', async (req, res) => {
  try {
    console.log('Manual low stock alert requested...');
    
    const products = await models.Products.findAll();
    const lowStockProducts = products.filter(product => 
      product.product_Stock < 10
    );

    console.log(`Found ${lowStockProducts.length} low stock products`);

    if (lowStockProducts.length === 0) {
      return res.json({
        success: true,
        message: 'No low stock products found',
        lowStockCount: 0
      });
    }

    const emailResult = await sendLowStockNotification(lowStockProducts);

    res.json({
      success: emailResult.success,
      message: emailResult.message,
      lowStockCount: lowStockProducts.length,
      products: lowStockProducts.map(p => ({
        name: p.product_Name,
        stock: p.product_Stock
      }))
    });

  } catch (error) {
    console.error('Error in low stock alert:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;