import type { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { HTTPException } from '../core/httpException.js';
import { isHTTPException, RedirectException } from '../core/httpException.js';

export function httpExceptionToResponse(exception: HTTPException, reply: FastifyReply): void {
  if (exception instanceof RedirectException) {
    reply.redirect(exception.redirectUrl, exception.statusCode);
    return;
  }

  reply.code(exception.statusCode);
  reply.send({ error: exception.message });
}

export interface FastifyHttpExceptionsOptions {
  logUnhandled?: boolean;
}

const fastifyHttpExceptionsPlugin: FastifyPluginCallback<FastifyHttpExceptionsOptions> = (fastify, options, done) => {
  const existingErrorHandler = (
    fastify as FastifyInstance & {
      _errorHandler?: (error: unknown, request: FastifyRequest, reply: FastifyReply) => unknown;
    }
  )._errorHandler;

  fastify.setErrorHandler((error, request, reply) => {
    if (isHTTPException(error)) {
      return httpExceptionToResponse(error, reply);
    }

    if (options.logUnhandled) {
      fastify.log.error({ err: error }, 'Unhandled error in fastify-http-exceptions');
    }

    if (existingErrorHandler) {
      return existingErrorHandler(error, request, reply);
    }

    return reply.send(error);
  });

  done();
};

export const fastifyHttpExceptions = fp(fastifyHttpExceptionsPlugin, {
  name: 'fastify-http-exceptions',
});
