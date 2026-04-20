'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Admin.belongsTo(models.Account,{
      //   foreignKey: 'account_Id',
      // })
      Admin.hasMany(models.AdminLogActivity, {
        foreignKey: 'adminId',
        as: 'activities'
      });
    }
  }
  Admin.init({
    password: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Admin',
    updatedAt: false,
    createdAt: false,
  });
  return Admin;
};