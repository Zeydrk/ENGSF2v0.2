'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdminLogActivity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // AdminLogActivity belongs to Admin
      AdminLogActivity.belongsTo(models.Admin, {
        foreignKey: 'adminId',
        as: 'admin'
      });
      
      // AdminLogActivity belongs to Products
      AdminLogActivity.belongsTo(models.Products, {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }
  AdminLogActivity.init({
    adminId: DataTypes.INTEGER,
    action: DataTypes.STRING,
    actionDetails: DataTypes.TEXT,
    productId: DataTypes.INTEGER,
    timestamp: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'AdminLogActivity',
    timestamps: false
  });
  return AdminLogActivity;
};