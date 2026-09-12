import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shop API",
      version: "1.0.0",
      description:
        "REST API for the multi-category e-commerce platform — auth, catalog, cart, orders, RBAC admin.",
    },
    servers: [{ url: "/api/v1" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Scans every route file for JSDoc @swagger comment blocks
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
