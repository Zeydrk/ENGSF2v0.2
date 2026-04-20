'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Account.hasOne(models.Admin,{
      //   foreignKey: 'account_Id',
      //   onDelete: 'CASCADE',
      //   onUpdate: 'CASCADE'
      // })
      // Account.hasOne(models.Seller,{
      //   foreignKey: 'account_Id',
      //   onDelete: 'CASCADE',
      //   onUpdate: 'CASCADE'
      // })
    }
  }
  Account.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Account',
  });
  return Account;
};