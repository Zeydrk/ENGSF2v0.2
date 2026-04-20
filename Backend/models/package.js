'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
    static associate(models) {
      Package.belongsTo(models.Seller, {
        foreignKey: 'seller_Id',
      });
    }
  }
  Package.init({
    seller_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Sellers",
        key: "id"
      }
    },
    package_Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    buyer_Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dropOff_Date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    package_Size: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    handling_Fee: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    payment_Status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    payment_Method: {
      type: DataTypes.STRING,
      allowNull: false
    },
    package_Status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // ADD THESE ARCHIVE FIELDS:
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    archiveReason: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Package',
    updatedAt: false,
    createdAt: false
  });

  return Package;
};