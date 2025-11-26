import type { FastifyReply } from 'fastify';
import type { HTTPResponse } from '../core/httpResponse.js';

export function sendHTTPResponse<T>(reply: FastifyReply, response: HTTPResponse<T>): FastifyReply {
  switch (response.statusCode) {
    case 200:
    case 201: {
      if (response.body !== undefined && typeof response.body === 'object') {
        reply.header('content-type', 'application/json');
        return reply.status(response.statusCode).send(JSON.stringify(response.body));
      }
      if (response.body !== undefined) {
        return reply.status(500).send({ error: `response is set but not an object: ${typeof response.body}` });
      }
      return reply.status(response.statusCode).send();
    }

    case 204:
      return reply.status(204).send();

    case 302:
      return reply.redirect(response.redirectUrl);

    case 304:
      return reply.status(304).send();

    case 400:
    case 401:
    case 403:
    case 404:
    case 500: {
      if (response.body !== undefined && typeof response.body === 'object') {
        reply.header('content-type', 'application/json');
        if (!('error' in response.body)) {
          return reply
            .status(500)
            .send({ error: `Response body is missing error field: ${JSON.stringify(response.body)}` });
        }
        return reply.status(response.statusCode).send(JSON.stringify(response.body));
      }
      if (response.body !== undefined) {
        return reply.status(500).send({ error: `Response body is not an object: ${typeof response.body}` });
      }
      return reply.status(response.statusCode).send();
    }

    default:
      return reply.status(500).send({ error: 'Internal server error' });
  }
}
