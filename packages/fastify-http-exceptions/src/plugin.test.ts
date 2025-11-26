import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import * as z from 'zod';
import { NotFoundException } from './core/httpException.js';
import type { HTTPResponse } from './core/httpResponse.js';
import { fastifyHttpExceptions, RedirectException } from './index.js';

describe('fastifyHttpExceptions plugin', () => {
  it('handles thrown HTTPException as 404', async () => {
    const app = Fastify();
    await app.register(fastifyHttpExceptions);

    app.get('/not-found', async () => {
      throw new NotFoundException('user');
    });

    const response = await app.inject({ method: 'GET', url: '/not-found' });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'user not found' });
  });

  it('handles RedirectException', async () => {
    const app = Fastify();
    await app.register(fastifyHttpExceptions);

    app.get('/redirect', async () => {
      throw new RedirectException('https://example.com');
    });

    const response = await app.inject({ method: 'GET', url: '/redirect' });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('https://example.com');
  });

  it('handles HTTPResponse returned from route', async () => {
    const app = Fastify();
    await app.register(fastifyHttpExceptions);

    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
    });

    app.get('/user', async () => {
      const body = UserSchema.parse({ id: '1', name: 'Alice' });
      return { statusCode: 200, body } satisfies HTTPResponse<z.infer<typeof UserSchema>>;
    });

    const response = await app.inject({ method: 'GET', url: '/user' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.json()).toEqual({ id: '1', name: 'Alice' });
  });
});
