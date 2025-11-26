import type { FastifyReply, FastifyRequest } from 'fastify';
import { httpExceptionToResponse, isHTTPException } from '../core/httpException.js';
import type { HTTPResponse } from '../core/httpResponse.js';
import { isHTTPResponse } from '../core/httpResponse.js';
import { sendHTTPResponse } from './sendHTTPResponse.js';

export function withHttpExceptions<T extends FastifyRequest = FastifyRequest>(
  handler: <U = unknown>(request: T, reply: FastifyReply) => Promise<FastifyReply | HTTPResponse<U> | unknown>,
): (request: T, reply: FastifyReply) => Promise<FastifyReply | unknown> {
  return async (request: T, reply: FastifyReply) => {
    try {
      const response = await handler(request, reply);
      if (isHTTPResponse(response)) {
        return sendHTTPResponse(reply, response);
      }
      return response;
    } catch (error) {
      if (isHTTPException(error)) {
        return sendHTTPResponse(reply, httpExceptionToResponse(error));
      }
      throw error;
    }
  };
}
