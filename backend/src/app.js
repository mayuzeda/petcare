import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { config } from './config.js';
import { HttpError } from './lib/http.js';
import accountRoutes from './routes/account.js';
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';
import eventRoutes from './routes/events.js';
import petRoutes from './routes/pets.js';
import searchRoutes from './routes/search.js';

export function buildApp({ db, logger = false }) {
  const app = Fastify({ logger });

  app.decorate('db', db);
  app.register(cors, { origin: true, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] });
  app.register(jwt, { secret: config.jwtSecret, sign: { expiresIn: config.jwtExpiresIn } });
  app.register(fastifyStatic, { root: config.publicDir, prefix: '/static/' });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({ error: error.message, details: error.details });
    }
    if (error.validation || error.statusCode === 400) {
      return reply.code(400).send({ error: 'Requisição inválida' });
    }
    request.log.error(error);
    return reply.code(500).send({ error: 'Erro interno do servidor' });
  });

  app.get('/health', async () => ({ status: 'ok', time: new Date().toISOString() }));

  app.register(authRoutes);

  app.register(async (privateScope) => {
    privateScope.decorateRequest('userId', null);
    privateScope.addHook('onRequest', async (request) => {
      try {
        const payload = await request.jwtVerify();
        request.userId = payload.sub;
      } catch {
        throw new HttpError(401, 'Faça login para continuar');
      }
    });
    privateScope.register(accountRoutes);
    privateScope.register(petRoutes);
    privateScope.register(eventRoutes);
    privateScope.register(documentRoutes);
    privateScope.register(searchRoutes);
  });

  return app;
}
