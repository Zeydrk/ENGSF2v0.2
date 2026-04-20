// controllers/adminLogController.js
const models = require("../../models");
const { Op } = require('sequelize');

async function getAdminLogs(req, res) {
  console.log('=== /logs API CALLED ===');
  console.log('req.user:', req.user);
  console.log('req.isAuthenticated:', req.isAuthenticated());
  console.log('========================');

  try {
    const { 
      page = 1, 
      limit = 30, 
      startDate, 
      endDate, 
      adminId, 
      action,
      productId 
    } = req.query;

    const whereConditions = {};

    // Date range filter
    if (startDate && endDate) {
      whereConditions.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.timestamp = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.timestamp = {
        [Op.lte]: new Date(endDate)
      };
    }

    // Admin filter
    if (adminId) {
      whereConditions.adminId = adminId;
    }

    // Action filter
    if (action) {
      whereConditions.action = action;
    }

    // Product filter
    if (productId) {
      whereConditions.productId = productId;
    }

    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);
    const offset = (currentPage - 1) * pageLimit;

    const { count, rows: logs } = await models.AdminLogActivity.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: models.Admin,
          as: 'admin',
          attributes: ['id', 'email'] // Only get needed admin fields
        },
        {
          model: models.Products,
          as: 'product',
          attributes: ['id', 'product_Name'] // Only get needed product fields
        },
      ],
        attributes: { 
            exclude: ['createdAt', 'updatedAt'] // ✅ EXPLICITLY EXCLUDE THESE FIELDS
        },
      order: [['timestamp', 'DESC']], // Newest first
      limit: pageLimit,
      offset: offset
    });

    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / pageLimit),
      currentPage: currentPage,
      logs: logs
    });

  } catch (err) {
    console.error("Error fetching admin logs:", err);
    res.status(500).json({ error: err.message });
  }
}

// Optional: Get all admins for filter dropdown
async function getAdminsForFilter(req, res) {
  try {
    const admins = await models.Admin.findAll({
      attributes: ['id', 'email'],
      order: [['email', 'ASC']]
    });
    res.status(200).json(admins);
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAdminLogs,
  getAdminsForFilter
};