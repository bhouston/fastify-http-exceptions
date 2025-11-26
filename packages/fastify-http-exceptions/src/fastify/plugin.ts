import type { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { httpExceptionToResponse, isHTTPException } from '../core/httpException.js';
import { type HTTPResponse, isHTTPResponse } from '../core/httpResponse.js';
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

  fastify.addHook('onSend', async (_request, reply, payload) => {
    if (!isHTTPResponse(payload)) {
      return payload;
    }

    const response = payload as HTTPResponse<unknown>;

    switch (response.statusCode) {
      case 200:
      case 201: {
        reply.code(response.statusCode);
        return response.body as unknown;
      }
      case 204:
      case 304: {
        reply.code(response.statusCode);
        return null;
      }
      case 302: {
        reply.code(302);
        if ('redirectUrl' in response && response.redirectUrl) {
          reply.header('location', response.redirectUrl);
        }
        return null;
      }
      case 400:
      case 401:
      case 403:
      case 404:
      case 500: {
        reply.code(response.statusCode);
        return response.body as unknown;
      }
      default:
        return payload;
    }
  });
  done();
};

export const fastifyHttpExceptions = fp(fastifyHttpExceptionsPlugin, {
  name: 'fastify-http-exceptions',
});
