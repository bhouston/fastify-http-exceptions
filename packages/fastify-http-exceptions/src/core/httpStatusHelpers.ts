import { HTTPStatusCode } from './statusCodes.js';

export function formatForbiddenMessage<Resource extends string = string>(resource: Resource, reason?: string): string {
  let message = `Access denied to ${resource}`;
  if (reason) {
    message += `: ${reason}`;
  }
  return message;
}

export function formatNotFoundMessage<Resource extends string = string>(resource: Resource, reason?: string): string {
  let message = `${resource} not found`;
  if (reason) {
    message += `: ${reason}`;
  }
  return message;
}

export function createErrorBody(message: string): { error: string } {
  return { error: message };
}

export const errorStatusCodes = [
  // 4xx – Client error
  HTTPStatusCode.BAD_REQUEST,
  HTTPStatusCode.UNAUTHORIZED,
  HTTPStatusCode.PAYMENT_REQUIRED,
  HTTPStatusCode.FORBIDDEN,
  HTTPStatusCode.NOT_FOUND,
  HTTPStatusCode.METHOD_NOT_ALLOWED,
  HTTPStatusCode.NOT_ACCEPTABLE,
  HTTPStatusCode.PROXY_AUTHENTICATION_REQUIRED,
  HTTPStatusCode.REQUEST_TIMEOUT,
  HTTPStatusCode.CONFLICT,
  HTTPStatusCode.GONE,
  HTTPStatusCode.LENGTH_REQUIRED,
  HTTPStatusCode.PRECONDITION_FAILED,
  HTTPStatusCode.PAYLOAD_TOO_LARGE,
  HTTPStatusCode.URI_TOO_LONG,
  HTTPStatusCode.UNSUPPORTED_MEDIA_TYPE,
  HTTPStatusCode.RANGE_NOT_SATISFIABLE,
  HTTPStatusCode.EXPECTATION_FAILED,
  HTTPStatusCode.IM_A_TEAPOT,
  HTTPStatusCode.MISDIRECTED_REQUEST,
  HTTPStatusCode.UNPROCESSABLE_ENTITY,
  HTTPStatusCode.LOCKED,
  HTTPStatusCode.FAILED_DEPENDENCY,
  HTTPStatusCode.TOO_EARLY,
  HTTPStatusCode.UPGRADE_REQUIRED,
  HTTPStatusCode.PRECONDITION_REQUIRED,
  HTTPStatusCode.TOO_MANY_REQUESTS,
  HTTPStatusCode.REQUEST_HEADER_FIELDS_TOO_LARGE,
  HTTPStatusCode.UNAVAILABLE_FOR_LEGAL_REASONS,

  // 5xx – Server error
  HTTPStatusCode.INTERNAL_SERVER_ERROR,
  HTTPStatusCode.NOT_IMPLEMENTED,
  HTTPStatusCode.BAD_GATEWAY,
  HTTPStatusCode.SERVICE_UNAVAILABLE,
  HTTPStatusCode.GATEWAY_TIMEOUT,
  HTTPStatusCode.HTTP_VERSION_NOT_SUPPORTED,
  HTTPStatusCode.VARIANT_ALSO_NEGOTIATES,
  HTTPStatusCode.INSUFFICIENT_STORAGE,
  HTTPStatusCode.LOOP_DETECTED,
  HTTPStatusCode.NOT_EXTENDED,
  HTTPStatusCode.NETWORK_AUTHENTICATION_REQUIRED,
] as const;
