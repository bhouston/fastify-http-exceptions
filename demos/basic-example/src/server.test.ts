import { describe, expect, it } from 'vitest';
import { buildServer } from './server.ts';

describe('basic-example demo server', () => {
  it('builds a Fastify instance and handles a simple request', async () => {
    const app = await buildServer();
    const response = await app.inject({ method: 'GET', url: '/users/1' });
    expect(response.statusCode).toBe(200);
  });
});


