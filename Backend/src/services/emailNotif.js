const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendLowStockNotification(lowStockProducts) {
  try {
    if (!lowStockProducts || lowStockProducts.length === 0) {
      return { success: false, message: 'No low stock products' };
    }

    const productListHTML = lowStockProducts.map(product => 
      `<li><strong>${product.product_Name}</strong>: ${product.product_Stock} units remaining</li>`
    ).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `📦 Low Stock Alert - ${lowStockProducts.length} Products`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #dc2626;">Low Stock Alert</h2>
          <p>The following products are running low on stock:</p>
          <ul>${productListHTML}</ul>
          <p>Please restock these items soon.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent from Inventory Management System on ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Low stock notification sent');
    
    return { 
      success: true, 
      message: `Notification sent for ${lowStockProducts.length} products`
    };
    
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

async function sendExpiringSoonNotification(expiringProducts) {
  try {
    if (!expiringProducts || expiringProducts.length === 0) {
      return { success: false, message: 'No expiring soon products' };
    }

    const productListHTML = expiringProducts.map(product => {
      const expiryDate = new Date(product.product_Expiry);
      const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      
      return `<li>
        <strong>${product.product_Name}</strong>: 
        Expires ${expiryDate.toLocaleDateString()} 
        (${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining)
      </li>`;
    }).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `⏰ Expiry Alert - ${expiringProducts.length} Products Expiring Soon`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #d97706;">Expiry Alert</h2>
          <p>The following products are expiring soon:</p>
          <ul>${productListHTML}</ul>
          <p>Please review these items to prevent waste.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent from Inventory Management System on ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Expiring soon notification sent');
    
    return { 
      success: true, 
      message: `Notification sent for ${expiringProducts.length} expiring products`
    };
    
  } catch (error) {
    console.error('Error sending expiry notification:', error);
    return { success: false, error: error.message };
  }
}

async function sendCombinedAlert(lowStockProducts, expiringProducts) {
  try {
    if ((!lowStockProducts || lowStockProducts.length === 0) && 
        (!expiringProducts || expiringProducts.length === 0)) {
      return { success: false, message: 'No alerts to send' };
    }

    let lowStockHTML = '';
    let expiringHTML = '';

    if (lowStockProducts.length > 0) {
      lowStockHTML = `
        <h3 style="color: #dc2626;">📦 Low Stock Items (${lowStockProducts.length})</h3>
        <ul>
          ${lowStockProducts.map(product => 
            `<li><strong>${product.product_Name}</strong>: ${product.product_Stock} units remaining</li>`
          ).join('')}
        </ul>
      `;
    }

    if (expiringProducts.length > 0) {
      expiringHTML = `
        <h3 style="color: #d97706;">⏰ Expiring Soon (${expiringProducts.length})</h3>
        <ul>
          ${expiringProducts.map(product => {
            const expiryDate = new Date(product.product_Expiry);
            const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
            return `<li>
              <strong>${product.product_Name}</strong>: 
              Expires ${expiryDate.toLocaleDateString()} 
              (${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining)
            </li>`;
          }).join('')}
        </ul>
      `;
    }

    const totalAlerts = lowStockProducts.length + expiringProducts.length;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `🚨 Combined Alert - ${totalAlerts} Issues Need Attention`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #7c2d12;">Inventory Alerts</h2>
          <p>You have ${totalAlerts} inventory issues that need your attention:</p>
          ${lowStockHTML}
          ${expiringHTML}
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent from Inventory Management System on ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Combined alert notification sent');
    
    return { 
      success: true, 
      message: `Combined notification sent for ${lowStockProducts.length} low stock and ${expiringProducts.length} expiring products`
    };
    
  } catch (error) {
    console.error('Error sending combined notification:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { 
  sendLowStockNotification, 
  sendExpiringSoonNotification,
  sendCombinedAlert 
};