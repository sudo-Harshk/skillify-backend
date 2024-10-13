const fastify = require('fastify')({ logger: true });
const helmet = require('@fastify/helmet');
const cors = require('@fastify/cors');
const subjectsRoutes = require('../routes/subjects');
const questionsRoutes = require('../routes/questions');

// Register Helmet for security
fastify.register(helmet);

// Register CORS with credentials allowed
fastify.register(cors, {
    origin: 'https://sudo-harshk.github.io', // Frontend GitHub Pages URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Allows cookies to be included in requests
});

// Register routes after CORS configuration
fastify.register(subjectsRoutes);
fastify.register(questionsRoutes);

// Root endpoint
fastify.get('/', async (request, reply) => {
    reply.send({
        message: 'Welcome to the Skillify API!',
        endpoints: [
            { endpoint: '/subjects', description: 'Retrieve a list of all subjects' },
            { endpoint: '/subjects/{subject}/chapters', description: 'Retrieve chapter information for a specific subject (replace {subject} with a subject name)' },
            { endpoint: '/questions', description: 'Retrieve questions and answers for practice' }
        ],
        note: 'Use the above endpoints to interact with the API.'
    });
});

// Start the server
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        fastify.log.info(`Server listening on http://localhost:3000`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
