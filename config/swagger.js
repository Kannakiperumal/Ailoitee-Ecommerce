const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "E-Commerce API",
            version: "1.0.0",
            description: "E-Commerce API documentation",
        },
        servers: [
            {
                url: "http://localhost:5000/api",
                description: "Local Server",
            },
        ],
        components: {
            securitySchemes: {
              BearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
              },
            },
          }
    },
    apis: ["./routes/*.js"], // Point to route files for documentation
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("Swagger documentation available at http://localhost:5000/api-docs");
};

module.exports = swaggerDocs;
