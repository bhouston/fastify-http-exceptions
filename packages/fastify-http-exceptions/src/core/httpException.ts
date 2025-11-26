import type { HTTPResponse } from './httpResponse.js';
import type { ExceptionResource } from './httpStatusHelpers.js';
import { formatForbiddenMessage, formatNotFoundMessage } from './httpStatusHelpers.js';
import { HTTPStatusCode } from './statusCodes.js';

export abstract class HTTPException extends Error {
  abstract readonly statusCode: number;

  override readonly message: string;

  readonly isHTTPException = true as const;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = new.target.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }
}

export class BadRequestException extends HTTPException {
  readonly statusCode = HTTPStatusCode.BAD_REQUEST;
}

export class UnauthorizedException extends HTTPException {
  readonly statusCode = HTTPStatusCode.UNAUTHORIZED;
}

export class ForbiddenException extends HTTPException {
  readonly statusCode = HTTPStatusCode.FORBIDDEN;

  constructor(resource: ExceptionResource, reason?: string) {
    super(formatForbiddenMessage(resource, reason));
  }
}

export class NotFoundException extends HTTPException {
  readonly statusCode = HTTPStatusCode.NOT_FOUND;

  constructor(resource: ExceptionResource, reason?: string) {
    super(formatNotFoundMessage(resource, reason));
  }
}

export class InternalServerErrorException extends HTTPException {
  readonly statusCode = HTTPStatusCode.INTERNAL_SERVER_ERROR;
}

export class RedirectException extends HTTPException {
  readonly statusCode = HTTPStatusCode.REDIRECT;

  readonly redirectUrl: string;

  constructor(redirectUrl: string, message?: string) {
    super(message ?? `Redirect to $redirectUrl`);
    this.redirectUrl = redirectUrl;
  }
}

export function httpExceptionToResponse(exception: HTTPException): HTTPResponse {
  if (exception instanceof RedirectException) {
    return redirect(exception.redirectUrl);
  }

  switch (exception.statusCode) {
    case HTTPStatusCode.BAD_REQUEST:
      return badRequest(exception.message);
    case HTTPStatusCode.UNAUTHORIZED:
      return unauthorized(exception.message);
    case HTTPStatusCode.FORBIDDEN:
      return { statusCode: HTTPStatusCode.FORBIDDEN, body: { error: exception.message } };
    case HTTPStatusCode.NOT_FOUND:
      return { statusCode: HTTPStatusCode.NOT_FOUND, body: { error: exception.message } };
    case HTTPStatusCode.INTERNAL_SERVER_ERROR:
      return internalServerError(exception.message);
    default:
      return internalServerError(exception.message);
  }
}

export const isHTTPException = (error: unknown): error is HTTPException => {
  if (error instanceof HTTPException) {
    return true;
  }

  if (
    error &&
    typeof error === 'object' &&
    'statusCode' in error &&
    typeof (error as HTTPException).statusCode === 'number' &&
    typeof (error as HTTPException).message === 'string' &&
    [400, 401, 403, 404, 500, 302].includes((error as HTTPException).statusCode)
  ) {
    return true;
  }

  if ((error as { isHTTPException?: unknown })?.isHTTPException === true) {
    return true;
  }

  return false;
};
