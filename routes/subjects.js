const subjectsData = require('../data/subjects');

async function routes(fastify, options) {
    fastify.get('/subjects', async (request, reply) => {
        return Object.keys(subjectsData);
    });

    
    fastify.get('/subjects/:subject/chapters', async (request, reply) => {
        const { subject } = request.params;
        const chapters = subjectsData[subject];

        if (!chapters) {
            return reply.status(404).send({ message: 'Chapters not found' });
        }
        
        return chapters;
    });
}

module.exports = routes;
