import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { NotFoundException } from './core/httpException.js';
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
});
