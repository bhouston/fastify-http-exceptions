import Fastify from 'fastify';
import { fastifyHttpExceptions } from 'fastify-http-exceptions';
import { BadRequestException, NotFoundException } from 'fastify-http-exceptions/core';
import * as z from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(fastifyHttpExceptions);

  app.get('/users/:id', async (request, reply) => {
    const id = (request.params as { id: string }).id;

    if (id === '0') {
      throw new BadRequestException('Invalid user id');
    }

    if (id === '404') {
      throw new NotFoundException('user');
    }

    const user = UserSchema.parse({ id, name: 'Demo User' });
    return reply.send(user);
  });

  app.delete('/users/:id', async (_request, reply) => reply.status(204).send());

  return app;
}

if (import.meta.main) {
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  const server = await buildServer();
  await server.listen({ port, host });
  // eslint-disable-next-line no-console
  console.log(`Server listening at http://${host}:${port}`);
}

export { buildServer };
