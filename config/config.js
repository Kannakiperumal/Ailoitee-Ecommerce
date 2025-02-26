require('dotenv').config(); 

module.exports = {
  development: {
    username: process.env.DB_USER || "postgres",
    password: "Admin",
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "postgres",
    dialectOptions: {
      schema: process.env.DB_SCHEMA
    } 
  },
  test: {
    username: process.env.DB_USER,
    password: "Admin",
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "postgres",
    dialectOptions: {
      schema: process.env.DB_SCHEMA
    }
  },
  production: {
    username: process.env.DB_USER,
    password: "Admin",
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "postgres",
    dialectOptions: {
      schema: process.env.DB_SCHEMA
    }
  }
};
