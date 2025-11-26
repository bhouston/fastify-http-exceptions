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

export abstract class RedirectException extends HTTPException {
  readonly redirectUrl: string;

  constructor(redirectUrl: string, message?: string) {
    super(message ?? `Redirect to ${redirectUrl}`);
    this.redirectUrl = redirectUrl;
  }
}

export class TemporaryRedirectException extends RedirectException {
  readonly statusCode = HTTPStatusCode.REDIRECT;

  constructor(redirectUrl: string, message?: string) {
    super(redirectUrl, message ?? `Temporary redirect to ${redirectUrl}`);
  }
}

export class PermanentRedirectException extends RedirectException {
  readonly statusCode = HTTPStatusCode.MOVED_PERMANENTLY;

  constructor(redirectUrl: string, message?: string) {
    super(redirectUrl, message ?? `Permanent redirect to ${redirectUrl}`);
  }
}

export class PaymentRequiredException extends HTTPException {
  readonly statusCode = HTTPStatusCode.PAYMENT_REQUIRED;

  constructor(message = 'Payment required') {
    super(message);
  }
}

export class NotAcceptableException extends HTTPException {
  readonly statusCode = HTTPStatusCode.NOT_ACCEPTABLE;

  constructor(message = 'Not acceptable') {
    super(message);
  }
}

export class ProxyAuthenticationRequiredException extends HTTPException {
  readonly statusCode = HTTPStatusCode.PROXY_AUTHENTICATION_REQUIRED;

  constructor(message = 'Proxy authentication required') {
    super(message);
  }
}

export class RequestTimeoutException extends HTTPException {
  readonly statusCode = HTTPStatusCode.REQUEST_TIMEOUT;

  constructor(message = 'Request timeout') {
    super(message);
  }
}

export class ConflictException extends HTTPException {
  readonly statusCode = HTTPStatusCode.CONFLICT;

  constructor(message = 'Conflict') {
    super(message);
  }
}

export class GoneException extends HTTPException {
  readonly statusCode = HTTPStatusCode.GONE;

  constructor(message = 'Gone') {
    super(message);
  }
}

export class LengthRequiredException extends HTTPException {
  readonly statusCode = HTTPStatusCode.LENGTH_REQUIRED;

  constructor(message = 'Length required') {
    super(message);
  }
}

export class PreconditionFailedException extends HTTPException {
  readonly statusCode = HTTPStatusCode.PRECONDITION_FAILED;

  constructor(message = 'Precondition failed') {
    super(message);
  }
}

export class PayloadTooLargeException extends HTTPException {
  readonly statusCode = HTTPStatusCode.PAYLOAD_TOO_LARGE;

  constructor(message = 'Payload too large') {
    super(message);
  }
}

export class UriTooLongException extends HTTPException {
  readonly statusCode = HTTPStatusCode.URI_TOO_LONG;

  constructor(message = 'URI too long') {
    super(message);
  }
}

export class UnsupportedMediaTypeException extends HTTPException {
  readonly statusCode = HTTPStatusCode.UNSUPPORTED_MEDIA_TYPE;

  constructor(message = 'Unsupported media type') {
    super(message);
  }
}

export class RangeNotSatisfiableException extends HTTPException {
  readonly statusCode = HTTPStatusCode.RANGE_NOT_SATISFIABLE;

  constructor(message = 'Range not satisfiable') {
    super(message);
  }
}

export class ExpectationFailedException extends HTTPException {
  readonly statusCode = HTTPStatusCode.EXPECTATION_FAILED;

  constructor(message = 'Expectation failed') {
    super(message);
  }
}

export class ImATeapotException extends HTTPException {
  readonly statusCode = HTTPStatusCode.IM_A_TEAPOT;

  constructor(message = "I'm a teapot") {
    super(message);
  }
}

export class MisdirectedRequestException extends HTTPException {
  readonly statusCode = HTTPStatusCode.MISDIRECTED_REQUEST;

  constructor(message = 'Misdirected request') {
    super(message);
  }
}

export class UnprocessableEntityException extends HTTPException {
  readonly statusCode = HTTPStatusCode.UNPROCESSABLE_ENTITY;

  // biome-ignore lint/security/noSecrets: standard HTTP reason phrase, not a secret
  constructor(message = 'Unprocessable entity error') {
    super(message);
  }
}

export class LockedException extends HTTPException {
  readonly statusCode = HTTPStatusCode.LOCKED;

  constructor(message = 'Locked') {
    super(message);
  }
}

export class FailedDependencyException extends HTTPException {
  readonly statusCode = HTTPStatusCode.FAILED_DEPENDENCY;

  constructor(message = 'Failed dependency') {
    super(message);
  }
}

export class TooEarlyException extends HTTPException {
  readonly statusCode = HTTPStatusCode.TOO_EARLY;

  constructor(message = 'Too early') {
    super(message);
  }
}

export class UpgradeRequiredException extends HTTPException {
  readonly statusCode = HTTPStatusCode.UPGRADE_REQUIRED;

  constructor(message = 'Upgrade required') {
    super(message);
  }
}

export class PreconditionRequiredException extends HTTPException {
  readonly statusCode = HTTPStatusCode.PRECONDITION_REQUIRED;

  constructor(message = 'Precondition required') {
    super(message);
  }
}

export class TooManyRequestsException extends HTTPException {
  readonly statusCode = HTTPStatusCode.TOO_MANY_REQUESTS;

  readonly retryAfterSeconds?: number;

  constructor(message = 'Too many requests', retryAfterSeconds?: number) {
    super(message);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class RequestHeaderFieldsTooLargeException extends HTTPException {
  readonly statusCode = HTTPStatusCode.REQUEST_HEADER_FIELDS_TOO_LARGE;

  constructor(message = 'Request header fields too large') {
    super(message);
  }
}

export class UnavailableForLegalReasonsException extends HTTPException {
  readonly statusCode = HTTPStatusCode.UNAVAILABLE_FOR_LEGAL_REASONS;

  constructor(message = 'Unavailable for legal reasons') {
    super(message);
  }
}

export class NotImplementedException extends HTTPException {
  readonly statusCode = HTTPStatusCode.NOT_IMPLEMENTED;

  constructor(message = 'Not implemented') {
    super(message);
  }
}

export class BadGatewayException extends HTTPException {
  readonly statusCode = HTTPStatusCode.BAD_GATEWAY;

  constructor(message = 'Bad gateway') {
    super(message);
  }
}

export class ServiceUnavailableException extends HTTPException {
  readonly statusCode = HTTPStatusCode.SERVICE_UNAVAILABLE;

  constructor(message = 'Service unavailable') {
    super(message);
  }
}

export class GatewayTimeoutException extends HTTPException {
  readonly statusCode = HTTPStatusCode.GATEWAY_TIMEOUT;

  constructor(message = 'Gateway timeout') {
    super(message);
  }
}

export class HttpVersionNotSupportedException extends HTTPException {
  readonly statusCode = HTTPStatusCode.HTTP_VERSION_NOT_SUPPORTED;

  constructor(message = 'HTTP version not supported') {
    super(message);
  }
}

export class VariantAlsoNegotiatesException extends HTTPException {
  readonly statusCode = HTTPStatusCode.VARIANT_ALSO_NEGOTIATES;

  constructor(message = 'Variant also negotiates') {
    super(message);
  }
}

export class InsufficientStorageException extends HTTPException {
  readonly statusCode = HTTPStatusCode.INSUFFICIENT_STORAGE;

  constructor(message = 'Insufficient storage') {
    super(message);
  }
}

export class LoopDetectedException extends HTTPException {
  readonly statusCode = HTTPStatusCode.LOOP_DETECTED;

  constructor(message = 'Loop detected') {
    super(message);
  }
}

export class NotExtendedException extends HTTPException {
  readonly statusCode = HTTPStatusCode.NOT_EXTENDED;

  constructor(message = 'Not extended') {
    super(message);
  }
}

export class NetworkAuthenticationRequiredException extends HTTPException {
  readonly statusCode = HTTPStatusCode.NETWORK_AUTHENTICATION_REQUIRED;

  constructor(message = 'Network authentication required') {
    super(message);
  }
}

export const isHTTPException = (error: unknown): error is HTTPException => {
  if (error instanceof HTTPException) {
    return true;
  }

  if ((error as { isHTTPException?: unknown })?.isHTTPException === true) {
    return true;
  }

  return false;
};
