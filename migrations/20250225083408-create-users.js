module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure the schema is created
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS "ecommerce";');

    // Create Users table inside the ecommerce schema
    await queryInterface.createTable(
      { schema: "ecommerce", tableName: "Users" },
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        role: {
          type: Sequelize.ENUM("admin", "customer"),
          allowNull: false,
          defaultValue: "customer"
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({ schema: "ecommerce", tableName: "Users" });
    await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS "ecommerce" CASCADE;');
  }
};
