const fastify = require('fastify')({ logger: true });
const helmet = require('@fastify/helmet');  
const cors = require('@fastify/cors');     
const subjectsRoutes = require('../routes/subjects');
const questionsRoutes = require('../routes/questions');

fastify.register(helmet); 
fastify.register(cors);   
fastify.register(subjectsRoutes);
fastify.register(questionsRoutes);

module.exports = async (req, res) => {
  await fastify.ready();
  fastify.server.emit('request', req, res);
};
