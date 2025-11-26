import type { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { httpExceptionToResponse, isHTTPException } from '../core/httpException.js';
import { HTTPStatusCode } from '../core/statusCodes.js';

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
      const response = httpExceptionToResponse(error);
      if (response.statusCode === HTTPStatusCode.REDIRECT && response.redirectUrl) {
        return reply.redirect(response.redirectUrl);
      }

      reply.code(response.statusCode);
      if (response.body) {
        return reply.send(response.body);
      }
      return reply.send();
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
