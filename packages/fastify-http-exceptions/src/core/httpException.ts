import { formatForbiddenMessage, formatNotFoundMessage } from './httpStatusHelpers.js';
import { HTTPStatusCode } from './statusCodes.js';

const ALL_HTTP_STATUS_CODES: readonly number[] = Object.values(HTTPStatusCode);

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

export class ForbiddenException<Resource extends string = string> extends HTTPException {
  readonly statusCode = HTTPStatusCode.FORBIDDEN;

  constructor(resource: Resource, reason?: string) {
    super(formatForbiddenMessage(resource, reason));
  }
}

export class NotFoundException<Resource extends string = string> extends HTTPException {
  readonly statusCode = HTTPStatusCode.NOT_FOUND;

  constructor(resource: Resource, reason?: string) {
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

export function httpExceptionToResponse(exception: HTTPException): {
  statusCode: number;
  body?: { error: string };
  redirectUrl?: string;
} {
  if (exception instanceof RedirectException) {
    return { statusCode: HTTPStatusCode.REDIRECT, redirectUrl: exception.redirectUrl };
  }

  switch (exception.statusCode) {
    case HTTPStatusCode.BAD_REQUEST:
    case HTTPStatusCode.UNAUTHORIZED:
    case HTTPStatusCode.FORBIDDEN:
    case HTTPStatusCode.NOT_FOUND:
    case HTTPStatusCode.INTERNAL_SERVER_ERROR:
      return { statusCode: exception.statusCode, body: { error: exception.message } };
    default:
      return { statusCode: HTTPStatusCode.INTERNAL_SERVER_ERROR, body: { error: exception.message } };
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
    ALL_HTTP_STATUS_CODES.includes((error as HTTPException).statusCode)
  ) {
    return true;
  }

  if ((error as { isHTTPException?: unknown })?.isHTTPException === true) {
    return true;
  }

  return false;
};
