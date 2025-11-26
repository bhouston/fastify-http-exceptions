import type { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { httpExceptionToResponse, isHTTPException } from '../core/httpException.js';
import type { HTTPResponse } from '../core/httpResponse.js';
import { isHTTPResponse } from '../core/httpResponse.js';
import { sendHTTPResponse } from './sendHTTPResponse.js';

// biome-ignore lint/security/noSecrets: hook name, not a secret

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

  fastify.addHook('preSerialization', async (_request, reply, payload) => {
    if (isHTTPResponse(payload)) {
      return sendHTTPResponse(reply, payload);
    }
    return payload;
  });
  done();
};

export const fastifyHttpExceptions = fp(fastifyHttpExceptionsPlugin, {
  name: 'fastify-http-exceptions',
});
