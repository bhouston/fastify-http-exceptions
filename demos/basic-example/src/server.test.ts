import { describe, expect, it } from 'vitest';
import { buildServer } from './server.ts';

describe('basic-example demo server', () => {
  it('returns 200 OK for an existing user', async () => {
    const app = await buildServer();
    const response = await app.inject({ method: 'GET', url: '/users/1' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ id: '1', name: 'Demo User' });
  });

  it('returns 400 Bad Request for invalid user id', async () => {
    const app = await buildServer();
    const response = await app.inject({ method: 'GET', url: '/users/0' });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: 'Invalid user id' });
  });

  it('returns 400 Bad Request for POST /users with error message', async () => {
    const app = await buildServer();
    const response = await app.inject({ method: 'POST', url: '/users' });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Username is already taken, username: 'blarg'" });
  });

  it('returns 404 Not Found for missing user', async () => {
    const app = await buildServer();
    const response = await app.inject({ method: 'GET', url: '/users/404' });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'user not found' });
  });

  it('returns 204 No Content for delete', async () => {
    const app = await buildServer();
    const response = await app.inject({ method: 'DELETE', url: '/users/1' });
    expect(response.statusCode).toBe(204);
    expect(response.body).toBe('');
  });

  it('returns 401 Unauthorized for unauthorized route', async () => {
    const app = await buildServer();
    const response = await app.inject({ method: 'GET', url: '/auth/unauthorized' });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'Not authenticated' });
  });

  it('returns 403 Forbidden for forbidden route', async () => {
    const app = await buildServer();
    const response = await app.inject({ method: 'GET', url: '/auth/forbidden' });
    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({ error: 'Access denied to user: not in org' });
  });

  it('returns 500 Internal Server Error for server error route', async () => {
    const app = await buildServer();
    const response = await app.inject({ method: 'GET', url: '/server-error' });
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: 'Something went wrong' });
  });

  it('returns 302 Temporary Redirect for temporary redirect route', async () => {
    const app = await buildServer();
    const response = await app.inject({ method: 'GET', url: '/redirect/temporary' });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('https://example.com/temporary');
  });

  it('returns 301 Permanent Redirect for permanent redirect route', async () => {
    const app = await buildServer();
    const response = await app.inject({ method: 'GET', url: '/redirect/permanent' });
    expect(response.statusCode).toBe(301);
    expect(response.headers.location).toBe('https://example.com/permanent');
  });
});
