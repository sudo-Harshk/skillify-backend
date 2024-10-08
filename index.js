const fastify = require('fastify')({ logger: true });
const helmet = require('@fastify/helmet');  // Correct import for helmet
const cors = require('@fastify/cors');      // Correct import for CORS
const subjectsRoutes = require('./routes/subjects');
const questionsRoutes = require('./routes/questions');


// Register plugins
fastify.register(helmet); // Using the updated plugin
fastify.register(cors);   // Using the updated CORS plugin

// Register routes
fastify.register(subjectsRoutes);
fastify.register(questionsRoutes);

// Start server
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        fastify.log.info(`Server listening on http://localhost:3000`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
