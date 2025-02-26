'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Order.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }
  }
  Order.init({
    userId: DataTypes.INTEGER,
    totalAmount: DataTypes.DECIMAL,
    status: DataTypes.STRING,
    address: DataTypes.TEXT,
    city: DataTypes.STRING,
    zipcode: DataTypes.STRING,
    deliveryDate: DataTypes.DATE,
    courierName: DataTypes.STRING,
    productId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};