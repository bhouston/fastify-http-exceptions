import type { FastifyPluginCallback, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import type { HTTPException } from '../core/httpException.js';
import { InternalServerErrorException, isHTTPException, RedirectException } from '../core/httpException.js';

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
  const existingErrorHandler = fastify.errorHandler;

  fastify.setErrorHandler((error, request, reply) => {
    if (isHTTPException(error)) {
      // log the stack upon internal server error here.
      if (error instanceof InternalServerErrorException) {
        fastify.log.error(`Internal server error: ${error.message}\n${error.stack}`);
      }
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
