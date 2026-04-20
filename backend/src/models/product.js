'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
      Product.belongsTo(models.User, {
        foreignKey: 'sellerId',
        as: 'seller'
      });
      Product.hasMany(models.Review, {
        foreignKey: 'productId',
        as: 'reviews'
      });
      Product.hasMany(models.CartItem, {
        foreignKey: 'productId',
        as: 'cartItems'
      });
      Product.hasMany(models.OrderItem, {
        foreignKey: 'productId',
        as: 'orderItems'
      });
    }
  }
  Product.init({
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    description: DataTypes.TEXT,
    image: {
      type: DataTypes.TEXT('long'),
      get() {
        const rawValue = this.getDataValue('image');
        if (!rawValue) return null;
        try {
          const parsed = JSON.parse(rawValue);
          return Array.isArray(parsed) ? (parsed[0] || null) : rawValue;
        } catch (error) {
          return rawValue;
        }
      },
      set(value) {
        if (Array.isArray(value)) {
          this.setDataValue('image', value.length ? JSON.stringify(value) : null);
        } else {
          this.setDataValue('image', value || null);
        }
      }
    },
    images: {
      type: DataTypes.VIRTUAL,
      get() {
        const rawValue = this.getDataValue('image');
        if (!rawValue) return [];
        try {
          const parsed = JSON.parse(rawValue);
          return Array.isArray(parsed) ? parsed : [rawValue];
        } catch (error) {
          return [rawValue];
        }
      },
      set(value) {
        this.setDataValue('image', Array.isArray(value) ? (value.length ? JSON.stringify(value) : null) : value || null);
      }
    },
    stock: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER,
    sellerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true
  });
  return Product;
};
