const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LearnIt API Documentation',
      version: '1.0.0',
      description: 'Interaktivní vzdělávací platforma - REST API dokumentace s testovacím rozhraním',
      contact: {
        name: 'LearnIt Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Topics',
        description: 'Správa a získávání témat',
      },
      {
        name: 'Lessons',
        description: 'Správa a získávání lekcí',
      },
      {
        name: 'Quiz',
        description: 'Kvízy a jejich vyhodnocení',
      },
      {
        name: 'User Progress',
        description: 'Sledování pokroku uživatele',
      },
    ],
  },
  apis: ['./routes/*.js', './server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
