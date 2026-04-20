'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     // this.belongsTo(models['Admin']);
     Products.hasMany(models.AdminLogActivity, {
      foreignKey: 'productId', 
      as: 'activityLogs'
    });
    }
  }
  Products.init({
    product_Name: DataTypes.STRING,
    product_Description: DataTypes.TEXT,
    product_RetailPrice: DataTypes.DECIMAL,
    product_BuyingPrice: DataTypes.DECIMAL,
    product_Stock: DataTypes.INTEGER,
    product_Expiry: DataTypes.DATE,
    product_Category: DataTypes.STRING,
    product_QrCodeValue: DataTypes.STRING,
    product_QrCodePath: DataTypes.STRING,
    isArchived: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Products',
    updatedAt: false,
    createdAt: false,
  });
  return Products;
};