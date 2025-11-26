import Fastify, { type FastifyReply } from 'fastify';
import { fastifyHttpExceptions } from 'fastify-http-exceptions';
import { BadRequestException, NotFoundException, noContent, ok } from 'fastify-http-exceptions/core';
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

    const user = { id, name: 'Demo User' };
    return (reply as FastifyReply & { sendHTTP<_T>(response: ReturnType<typeof ok>): FastifyReply }).sendHTTP(
      ok(UserSchema, user),
    );
  });

  app.delete('/users/:id', async (_request, reply) =>
    (reply as FastifyReply & { sendHTTP<_T>(response: ReturnType<typeof noContent>): FastifyReply }).sendHTTP(
      noContent(),
    ),
  );

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
