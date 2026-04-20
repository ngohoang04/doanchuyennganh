'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Review, { foreignKey: 'userId', as: 'reviews' });
      User.hasMany(models.Message, { foreignKey: 'senderId', as: 'sentMessages' });
      User.hasMany(models.Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
      User.hasOne(models.Cart, { foreignKey: 'userId', as: 'cart' });
      User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
      User.hasMany(models.Product, { foreignKey: 'sellerId', as: 'products' });
    }
  }
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    phone: DataTypes.STRING,
    avatar: DataTypes.TEXT,
    authProvider: { type: DataTypes.STRING, field: 'auth_provider' },
    providerUserId: { type: DataTypes.STRING, field: 'provider_user_id' },
    role: DataTypes.STRING,
    sellerStatus: DataTypes.STRING,
    shopName: { type: DataTypes.STRING, field: 'shop_name' },
    shopDescription: { type: DataTypes.TEXT, field: 'shop_description' },
    shopAddress: { type: DataTypes.STRING, field: 'shop_address' },
    idCardNumber: { type: DataTypes.STRING, field: 'id_card_number' },
    idCardFront: { type: DataTypes.TEXT, field: 'id_card_front' },
    idCardBack: { type: DataTypes.TEXT, field: 'id_card_back' },
    businessLicense: { type: DataTypes.TEXT, field: 'business_license' },
    bankAccount: { type: DataTypes.STRING, field: 'bank_account' },
    shopLogo: { type: DataTypes.TEXT, field: 'shop_logo' }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true
  });
  return User;
};
