const fastify = require('fastify')({ logger: true });
const helmet = require('@fastify/helmet');  
const cors = require('@fastify/cors');     
const subjectsRoutes = require('../routes/subjects');
const questionsRoutes = require('../routes/questions');

fastify.register(helmet); 
fastify.register(cors);   

fastify.register(subjectsRoutes);
fastify.register(questionsRoutes);

fastify.get('/', async (request, reply) => {
    reply.send({
        message: 'Welcome to the Skillify API!',
        endpoints: [
            {
                endpoint: '/subjects',
                description: 'Retrieve information about various subjects'
            },
            {
                endpoint: '/questions',
                description: 'Retrieve questions and answers for practice'
            }
        ],
        note: 'Use the above endpoints to interact with the API.'
    });
});

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
