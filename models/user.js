const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class User extends Model {}

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "customer"), // Manually define ENUM here
        allowNull: false,
        defaultValue: "customer",
      },
    },
    {
      sequelize,
      schema: "ecommerce",
      tableName: "Users",// En
      timestamps: true, 
    }
  );

  return User;
};
