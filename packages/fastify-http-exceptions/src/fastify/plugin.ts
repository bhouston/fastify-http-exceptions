import type { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { httpExceptionToResponse, isHTTPException } from '../core/httpException.js';
import type { HTTPResponse } from '../core/httpResponse.js';
import { sendHTTPResponse } from './sendHTTPResponse.js';

export interface FastifyHttpExceptionsOptions {
  logUnhandled?: boolean;
}

const fastifyHttpExceptionsPlugin: FastifyPluginCallback<FastifyHttpExceptionsOptions> = (fastify, options, done) => {
  fastify.decorateReply('sendHTTP', function <T>(this: FastifyReply, response: HTTPResponse<T>) {
    return sendHTTPResponse(this, response);
  });

  const existingErrorHandler = (
    fastify as FastifyInstance & {
      _errorHandler?: (error: unknown, request: FastifyRequest, reply: FastifyReply) => unknown;
    }
  )._errorHandler;

  fastify.setErrorHandler((error, request, reply) => {
    if (isHTTPException(error)) {
      const response = httpExceptionToResponse(error);
      return sendHTTPResponse(reply, response);
    }

    if (options.logUnhandled) {
      fastify.log.error({ err: error }, 'Unhandled error in fastify-http-exceptions');
    }

    if (existingErrorHandler) {
      return existingErrorHandler(error, request, reply);
    }

    return reply.send(error);
  });

  // Note: plugin focuses on thrown HTTPExceptions; returned HTTPResponse values
  // can be sent explicitly via reply.sendHTTP or by using the withHttpExceptions helper.
  done();
};

export const fastifyHttpExceptions = fp(fastifyHttpExceptionsPlugin, {
  name: 'fastify-http-exceptions',
});
