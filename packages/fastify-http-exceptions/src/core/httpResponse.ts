import type { ExceptionResource } from './httpStatusHelpers.js';
import { formatForbiddenMessage, formatNotFoundMessage } from './httpStatusHelpers.js';
import { HTTPStatusCode } from './statusCodes.js';

export type HTTPResponse<T = unknown> =
  | { statusCode: 200; body: T }
  | { statusCode: 201; body: T }
  | { statusCode: 204 }
  | { statusCode: 302; redirectUrl: string }
  | { statusCode: 304 }
  | { statusCode: 400; body: { error: string } }
  | { statusCode: 401; body: { error: string } }
  | { statusCode: 403; body: { error: string } }
  | { statusCode: 404; body: { error: string } }
  | { statusCode: 500; body: { error: string } };

export function ok<T>(_: unknown, body: T): HTTPResponse<T> {
  return { statusCode: HTTPStatusCode.OK, body };
}

export function created<T>(_: unknown, body: T): HTTPResponse<T> {
  return { statusCode: HTTPStatusCode.CREATED, body };
}

export function noContent(): HTTPResponse<never> {
  return { statusCode: HTTPStatusCode.NO_CONTENT };
}

export function redirect(redirectUrl: string): HTTPResponse<never> {
  return { statusCode: HTTPStatusCode.REDIRECT, redirectUrl };
}

export function notModified(): HTTPResponse<never> {
  return { statusCode: HTTPStatusCode.NOT_MODIFIED };
}

export function badRequest(message: string): HTTPResponse<never> {
  return { statusCode: HTTPStatusCode.BAD_REQUEST, body: { error: message } };
}

export function unauthorized(message: string): HTTPResponse<never> {
  return { statusCode: HTTPStatusCode.UNAUTHORIZED, body: { error: message } };
}

export function forbidden(resource: ExceptionResource, reason?: string): HTTPResponse<never> {
  return { statusCode: HTTPStatusCode.FORBIDDEN, body: { error: formatForbiddenMessage(resource, reason) } };
}

export function notFound(resource: ExceptionResource, reason?: string): HTTPResponse<never> {
  return { statusCode: HTTPStatusCode.NOT_FOUND, body: { error: formatNotFoundMessage(resource, reason) } };
}

export function internalServerError(message: string): HTTPResponse<never> {
  return { statusCode: HTTPStatusCode.INTERNAL_SERVER_ERROR, body: { error: message } };
}

export const isHTTPResponse = <T = unknown>(response: unknown): response is HTTPResponse<T> => {
  if (
    response &&
    typeof response === 'object' &&
    response !== null &&
    'statusCode' in response &&
    typeof (response as HTTPResponse).statusCode === 'number' &&
    [200, 201, 204, 302, 400, 401, 403, 404, 500].includes((response as HTTPResponse<T>).statusCode)
  ) {
    return true;
  }
  return false;
};
