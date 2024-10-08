const fastify = require('fastify')({ logger: true });
const helmet = require('@fastify/helmet');  
const cors = require('@fastify/cors');     
const subjectsRoutes = require('../routes/subjects');
const questionsRoutes = require('../routes/questions');

// Register plugins
fastify.register(helmet);
fastify.register(cors);

// Register routes
fastify.register(subjectsRoutes);
fastify.register(questionsRoutes);

// Export the Fastify instance for Vercel
module.exports = fastify;
