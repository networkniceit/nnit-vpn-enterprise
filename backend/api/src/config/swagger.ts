import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NNIT VPN Enterprise API',
      version: '2.5.0',
      description: 'Enterprise-Grade VPN Platform API Documentation',
      contact: {
        name: 'NetworkNiceIT',
        url: 'https://github.com/networkniceit/nnit-vpn-enterprise',
      },
      license: {
        name: 'Enterprise',
      },
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
      {
        url: 'https://api.nnitvpn.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
