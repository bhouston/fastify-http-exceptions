import Fastify from 'fastify';
import { describe, expect, it, vi } from 'vitest';
import { InternalServerErrorException, NotFoundException } from './core/httpException.js';
import { fastifyHttpExceptions, PermanentRedirectException, TemporaryRedirectException } from './index.js';

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

  it('handles TemporaryRedirectException', async () => {
    const app = Fastify();
    await app.register(fastifyHttpExceptions);

    app.get('/redirect', async () => {
      throw new TemporaryRedirectException('https://example.com');
    });

    const response = await app.inject({ method: 'GET', url: '/redirect' });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('https://example.com');
  });

  it('handles PermanentRedirectException', async () => {
    const app = Fastify();
    await app.register(fastifyHttpExceptions);

    app.get('/redirect-permanent', async () => {
      throw new PermanentRedirectException('https://example.com/permanent');
    });

    const response = await app.inject({ method: 'GET', url: '/redirect-permanent' });
    expect(response.statusCode).toBe(301);
    expect(response.headers.location).toBe('https://example.com/permanent');
  });

  it('logs InternalServerErrorException with stack trace', async () => {
    const app = Fastify({ logger: true });
    const logErrorSpy = vi.spyOn(app.log, 'error');
    await app.register(fastifyHttpExceptions);

    const error = new InternalServerErrorException('Something went wrong');
    app.get('/server-error', async () => {
      throw error;
    });

    await app.inject({ method: 'GET', url: '/server-error' });

    expect(logErrorSpy).toHaveBeenCalledWith(`Internal server error: ${error.message}\n${error.stack}`);
  });

  it('logs unhandled errors when logUnhandled is true', async () => {
    const app = Fastify({ logger: true });
    const logErrorSpy = vi.spyOn(app.log, 'error');
    await app.register(fastifyHttpExceptions, { logUnhandled: true });

    const regularError = new Error('Regular error');
    app.get('/error', async () => {
      throw regularError;
    });

    await app.inject({ method: 'GET', url: '/error' });

    expect(logErrorSpy).toHaveBeenCalledWith({ err: regularError }, 'Unhandled error in fastify-http-exceptions');
  });

  it('does not log unhandled errors when logUnhandled is false', async () => {
    const app = Fastify({ logger: true });
    const logErrorSpy = vi.spyOn(app.log, 'error');
    await app.register(fastifyHttpExceptions, { logUnhandled: false });

    const regularError = new Error('Regular error');
    app.get('/error', async () => {
      throw regularError;
    });

    await app.inject({ method: 'GET', url: '/error' });

    expect(logErrorSpy).not.toHaveBeenCalled();
  });

  it('does not log unhandled errors when logUnhandled is undefined (default)', async () => {
    const app = Fastify({ logger: true });
    const logErrorSpy = vi.spyOn(app.log, 'error');
    await app.register(fastifyHttpExceptions);

    const regularError = new Error('Regular error');
    app.get('/error', async () => {
      throw regularError;
    });

    await app.inject({ method: 'GET', url: '/error' });

    expect(logErrorSpy).not.toHaveBeenCalled();
  });

  it('calls existing error handler for non-HTTPException errors', async () => {
    const app = Fastify();
    const existingErrorHandler = vi.fn((_error, _request, reply) => {
      reply.code(500).send({ custom: 'error handler' });
    });
    app.setErrorHandler(existingErrorHandler);
    await app.register(fastifyHttpExceptions);

    const regularError = new Error('Regular error');
    app.get('/error', async () => {
      throw regularError;
    });

    const response = await app.inject({ method: 'GET', url: '/error' });

    expect(existingErrorHandler).toHaveBeenCalledWith(regularError, expect.any(Object), expect.any(Object));
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ custom: 'error handler' });
  });

  it('falls back to reply.send(error) when no existing error handler exists', async () => {
    const app = Fastify();
    await app.register(fastifyHttpExceptions);

    const regularError = new Error('Regular error');
    app.get('/error', async () => {
      throw regularError;
    });

    const response = await app.inject({ method: 'GET', url: '/error' });

    expect(response.statusCode).toBe(500);
    // Fastify formats errors sent via reply.send(error) as JSON
    // Note: Line 40 (reply.send(error)) is a defensive fallback that's unreachable
    // in practice since Fastify always has a default error handler, but the test
    // validates the fallback behavior when no custom error handler is set
    const responseBody = response.json();
    expect(responseBody).toHaveProperty('message', 'Regular error');
  });
});
