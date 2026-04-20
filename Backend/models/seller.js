'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Seller extends Model {
    static associate(models) {
      Seller.hasMany(models.Package, {
        foreignKey: 'seller_Id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Seller.init(
    {
      seller_Name: DataTypes.STRING,
      seller_Phone: DataTypes.STRING,
      seller_Email: DataTypes.STRING,
      balance: DataTypes.DECIMAL(10, 2)
    },
    {
      sequelize,
      modelName: 'Seller',
      createdAt: false,
      updatedAt: false
    }
  );

  return Seller;
};
