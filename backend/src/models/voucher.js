'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
    static associate(models) {
      Voucher.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'owner'
      });
    }
  }

  Voucher.init({
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    discountType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    minOrderValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    maxDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    shippingDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ownerRole: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    startsAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endsAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Voucher',
    tableName: 'vouchers',
    timestamps: true
  });

  return Voucher;
};
