import { describe, expect, it } from 'vitest';
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ExpectationFailedException,
  FailedDependencyException,
  ForbiddenException,
  GatewayTimeoutException,
  GoneException,
  HTTPException,
  HttpVersionNotSupportedException,
  httpExceptionToResponse,
  ImATeapotException,
  InsufficientStorageException,
  InternalServerErrorException,
  isHTTPException,
  LengthRequiredException,
  LockedException,
  LoopDetectedException,
  MisdirectedRequestException,
  NetworkAuthenticationRequiredException,
  NotAcceptableException,
  NotExtendedException,
  NotFoundException,
  NotImplementedException,
  PayloadTooLargeException,
  PaymentRequiredException,
  PermanentRedirectException,
  PreconditionFailedException,
  PreconditionRequiredException,
  ProxyAuthenticationRequiredException,
  RangeNotSatisfiableException,
  RedirectException,
  RequestHeaderFieldsTooLargeException,
  RequestTimeoutException,
  ServiceUnavailableException,
  TemporaryRedirectException,
  TooEarlyException,
  TooManyRequestsException,
  UnauthorizedException,
  UnavailableForLegalReasonsException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
  UpgradeRequiredException,
  UriTooLongException,
  VariantAlsoNegotiatesException,
} from './core/httpException.js';
import { HTTPStatusCode } from './core/statusCodes.js';

describe('httpException', () => {
  describe('exception constructors', () => {
    it('should create BadRequestException', () => {
      const exception = new BadRequestException('Invalid input');
      expect(exception).toBeInstanceOf(BadRequestException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.statusCode).toBe(HTTPStatusCode.BAD_REQUEST);
      expect(exception.message).toBe('Invalid input');
      expect(exception.name).toBe('BadRequestException');
    });

    it('should create UnauthorizedException', () => {
      const exception = new UnauthorizedException('Not authenticated');
      expect(exception).toBeInstanceOf(UnauthorizedException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
      expect(exception.message).toBe('Not authenticated');
      expect(exception.name).toBe('UnauthorizedException');
    });

    it('should create ForbiddenException with resource only', () => {
      const exception = new ForbiddenException('user');
      expect(exception).toBeInstanceOf(ForbiddenException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
      expect(exception.message).toBe('Access denied to user');
      expect(exception.name).toBe('ForbiddenException');
    });

    it('should create ForbiddenException with resource and reason', () => {
      const exception = new ForbiddenException('project', 'insufficient permissions');
      expect(exception).toBeInstanceOf(ForbiddenException);
      expect(exception.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
      expect(exception.message).toBe('Access denied to project: insufficient permissions');
    });

    it('should create NotFoundException with resource only', () => {
      const exception = new NotFoundException('asset');
      expect(exception).toBeInstanceOf(NotFoundException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.statusCode).toBe(HTTPStatusCode.NOT_FOUND);
      expect(exception.message).toBe('asset not found');
      expect(exception.name).toBe('NotFoundException');
    });

    it('should create NotFoundException with resource and reason', () => {
      const exception = new NotFoundException('org', 'deleted');
      expect(exception).toBeInstanceOf(NotFoundException);
      expect(exception.statusCode).toBe(HTTPStatusCode.NOT_FOUND);
      expect(exception.message).toBe('org not found: deleted');
    });

    it('should create InternalServerErrorException', () => {
      const exception = new InternalServerErrorException('Server error');
      expect(exception).toBeInstanceOf(InternalServerErrorException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(exception.message).toBe('Server error');
      expect(exception.name).toBe('InternalServerErrorException');
    });

    it('should create TemporaryRedirectException with redirectUrl only', () => {
      const exception = new TemporaryRedirectException('https://example.com');
      expect(exception).toBeInstanceOf(TemporaryRedirectException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.statusCode).toBe(HTTPStatusCode.REDIRECT);
      expect(exception.redirectUrl).toBe('https://example.com');
      expect(exception.message).toBe('Temporary redirect to https://example.com');
      expect(exception.name).toBe('TemporaryRedirectException');
    });

    it('should create PermanentRedirectException with redirectUrl only', () => {
      const exception = new PermanentRedirectException('https://example.com');
      expect(exception).toBeInstanceOf(PermanentRedirectException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.statusCode).toBe(HTTPStatusCode.MOVED_PERMANENTLY);
      expect(exception.redirectUrl).toBe('https://example.com');
      expect(exception.message).toBe('Permanent redirect to https://example.com');
      expect(exception.name).toBe('PermanentRedirectException');
    });

    it('should create TemporaryRedirectException with redirectUrl and message', () => {
      const exception = new TemporaryRedirectException('https://example.com', 'Custom temp redirect');
      expect(exception).toBeInstanceOf(TemporaryRedirectException);
      expect(exception.statusCode).toBe(HTTPStatusCode.REDIRECT);
      expect(exception.redirectUrl).toBe('https://example.com');
      expect(exception.message).toBe('Custom temp redirect');
    });
  });

  describe('httpExceptionToResponse', () => {
    it('should convert BadRequestException to response', () => {
      const exception = new BadRequestException('Invalid input');
      const response = httpExceptionToResponse(exception);

      expect(response.statusCode).toBe(HTTPStatusCode.BAD_REQUEST);
      if ('body' in response) {
        expect(response.body).toEqual({ error: 'Invalid input' });
      }
    });

    it('should convert UnauthorizedException to response', () => {
      const exception = new UnauthorizedException('Not authenticated');
      const response = httpExceptionToResponse(exception);

      expect(response.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
      if ('body' in response) {
        expect(response.body).toEqual({ error: 'Not authenticated' });
      }
    });

    it('should convert ForbiddenException to response', () => {
      const exception = new ForbiddenException('user');
      const response = httpExceptionToResponse(exception);

      expect(response.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
      if ('body' in response) {
        expect(response.body).toEqual({ error: 'Access denied to user' });
      }
    });

    it('should convert NotFoundException to response', () => {
      const exception = new NotFoundException('asset');
      const response = httpExceptionToResponse(exception);

      expect(response.statusCode).toBe(HTTPStatusCode.NOT_FOUND);
      if ('body' in response) {
        expect(response.body).toEqual({ error: 'asset not found' });
      }
    });

    it('should convert InternalServerErrorException to response', () => {
      const exception = new InternalServerErrorException('Server error');
      const response = httpExceptionToResponse(exception);

      expect(response.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      if ('body' in response) {
        expect(response.body).toEqual({ error: 'Server error' });
      }
    });

    it('should convert TemporaryRedirectException to response', () => {
      const exception = new TemporaryRedirectException('https://example.com');
      const response = httpExceptionToResponse(exception);

      expect(response.statusCode).toBe(HTTPStatusCode.REDIRECT);
      expect('redirectUrl' in response && response.redirectUrl).toBe('https://example.com');
    });

    it('should convert PermanentRedirectException to response', () => {
      const exception = new PermanentRedirectException('https://example.com');
      const response = httpExceptionToResponse(exception);

      expect(response.statusCode).toBe(HTTPStatusCode.MOVED_PERMANENTLY);
      expect('redirectUrl' in response && response.redirectUrl).toBe('https://example.com');
    });

    it('should handle non-error status codes with fallback', () => {
      class CustomOkException extends HTTPException {
        readonly statusCode = HTTPStatusCode.OK;
      }
      const exception = new CustomOkException('Weird ok');
      const response = httpExceptionToResponse(exception);

      expect(response.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      if ('body' in response) {
        expect(response.body).toEqual({ error: 'Weird ok' });
      }
    });
  });

  describe('isHTTPException', () => {
    it('should return true for HTTPException instances', () => {
      expect(isHTTPException(new BadRequestException('test'))).toBe(true);
      expect(isHTTPException(new UnauthorizedException('test'))).toBe(true);
      expect(isHTTPException(new ForbiddenException('user'))).toBe(true);
      expect(isHTTPException(new NotFoundException('asset'))).toBe(true);
      expect(isHTTPException(new InternalServerErrorException('test'))).toBe(true);
      expect(isHTTPException(new TemporaryRedirectException('https://example.com'))).toBe(true);
      expect(isHTTPException(new PermanentRedirectException('https://example.com'))).toBe(true);
    });

    it('should return false for non-HTTPException errors', () => {
      expect(isHTTPException(new Error('test'))).toBe(false);
      expect(isHTTPException('string')).toBe(false);
      expect(isHTTPException(null)).toBe(false);
      expect(isHTTPException(undefined)).toBe(false);
      expect(isHTTPException({})).toBe(false);
    });

    it('should return true for objects with HTTPException shape', () => {
      const mockException = {
        statusCode: 400,
        message: 'Bad request',
      } as const;
      expect(isHTTPException(mockException)).toBe(true);
    });

    it('should return false for objects with invalid status code', () => {
      const mockException = {
        statusCode: 999,
        message: 'Invalid',
      };
      expect(isHTTPException(mockException)).toBe(false);
    });

    it('should return true for objects with isHTTPException flag even with invalid status code', () => {
      const mockException = {
        statusCode: 999,
        message: 'Invalid but flagged',
        isHTTPException: true,
      };
      expect(isHTTPException(mockException)).toBe(true);
    });

    it('should return false for objects with non-numeric statusCode', () => {
      const mockException = {
        statusCode: '400',
        message: 'Bad request',
      } as unknown as { statusCode: number; message: string };
      expect(isHTTPException(mockException)).toBe(false);
    });

    it('should return false for objects without message', () => {
      const mockException = {
        statusCode: 400,
      } as unknown as HTTPException;
      expect(isHTTPException(mockException)).toBe(false);
    });
  });

  describe('additional exception subclasses', () => {
    it('should construct simple exceptions with default messages and status codes', () => {
      const cases: {
        Ctor: new (message?: string) => HTTPException;
        expectedStatus: HTTPStatusCode;
        expectedDefaultMessage: string;
      }[] = [
        {
          Ctor: PaymentRequiredException,
          expectedStatus: HTTPStatusCode.PAYMENT_REQUIRED,
          expectedDefaultMessage: 'Payment required',
        },
        {
          Ctor: NotAcceptableException,
          expectedStatus: HTTPStatusCode.NOT_ACCEPTABLE,
          expectedDefaultMessage: 'Not acceptable',
        },
        {
          Ctor: ProxyAuthenticationRequiredException,
          expectedStatus: HTTPStatusCode.PROXY_AUTHENTICATION_REQUIRED,
          expectedDefaultMessage: 'Proxy authentication required',
        },
        {
          Ctor: RequestTimeoutException,
          expectedStatus: HTTPStatusCode.REQUEST_TIMEOUT,
          expectedDefaultMessage: 'Request timeout',
        },
        { Ctor: ConflictException, expectedStatus: HTTPStatusCode.CONFLICT, expectedDefaultMessage: 'Conflict' },
        { Ctor: GoneException, expectedStatus: HTTPStatusCode.GONE, expectedDefaultMessage: 'Gone' },
        {
          Ctor: LengthRequiredException,
          expectedStatus: HTTPStatusCode.LENGTH_REQUIRED,
          expectedDefaultMessage: 'Length required',
        },
        {
          Ctor: PreconditionFailedException,
          expectedStatus: HTTPStatusCode.PRECONDITION_FAILED,
          expectedDefaultMessage: 'Precondition failed',
        },
        {
          Ctor: PayloadTooLargeException,
          expectedStatus: HTTPStatusCode.PAYLOAD_TOO_LARGE,
          expectedDefaultMessage: 'Payload too large',
        },
        {
          Ctor: UriTooLongException,
          expectedStatus: HTTPStatusCode.URI_TOO_LONG,
          expectedDefaultMessage: 'URI too long',
        },
        {
          Ctor: UnsupportedMediaTypeException,
          expectedStatus: HTTPStatusCode.UNSUPPORTED_MEDIA_TYPE,
          expectedDefaultMessage: 'Unsupported media type',
        },
        {
          Ctor: RangeNotSatisfiableException,
          expectedStatus: HTTPStatusCode.RANGE_NOT_SATISFIABLE,
          expectedDefaultMessage: 'Range not satisfiable',
        },
        {
          Ctor: ExpectationFailedException,
          expectedStatus: HTTPStatusCode.EXPECTATION_FAILED,
          expectedDefaultMessage: 'Expectation failed',
        },
        {
          Ctor: ImATeapotException,
          expectedStatus: HTTPStatusCode.IM_A_TEAPOT,
          expectedDefaultMessage: "I'm a teapot",
        },
        {
          Ctor: MisdirectedRequestException,
          expectedStatus: HTTPStatusCode.MISDIRECTED_REQUEST,
          expectedDefaultMessage: 'Misdirected request',
        },
        {
          Ctor: UnprocessableEntityException,
          expectedStatus: HTTPStatusCode.UNPROCESSABLE_ENTITY,
          expectedDefaultMessage: 'Unprocessable entity error',
        },
        { Ctor: LockedException, expectedStatus: HTTPStatusCode.LOCKED, expectedDefaultMessage: 'Locked' },
        {
          Ctor: FailedDependencyException,
          expectedStatus: HTTPStatusCode.FAILED_DEPENDENCY,
          expectedDefaultMessage: 'Failed dependency',
        },
        { Ctor: TooEarlyException, expectedStatus: HTTPStatusCode.TOO_EARLY, expectedDefaultMessage: 'Too early' },
        {
          Ctor: UpgradeRequiredException,
          expectedStatus: HTTPStatusCode.UPGRADE_REQUIRED,
          expectedDefaultMessage: 'Upgrade required',
        },
        {
          Ctor: PreconditionRequiredException,
          expectedStatus: HTTPStatusCode.PRECONDITION_REQUIRED,
          expectedDefaultMessage: 'Precondition required',
        },
        {
          Ctor: RequestHeaderFieldsTooLargeException,
          expectedStatus: HTTPStatusCode.REQUEST_HEADER_FIELDS_TOO_LARGE,
          expectedDefaultMessage: 'Request header fields too large',
        },
        {
          Ctor: UnavailableForLegalReasonsException,
          expectedStatus: HTTPStatusCode.UNAVAILABLE_FOR_LEGAL_REASONS,
          expectedDefaultMessage: 'Unavailable for legal reasons',
        },
        {
          Ctor: NotImplementedException,
          expectedStatus: HTTPStatusCode.NOT_IMPLEMENTED,
          expectedDefaultMessage: 'Not implemented',
        },
        {
          Ctor: BadGatewayException,
          expectedStatus: HTTPStatusCode.BAD_GATEWAY,
          expectedDefaultMessage: 'Bad gateway',
        },
        {
          Ctor: ServiceUnavailableException,
          expectedStatus: HTTPStatusCode.SERVICE_UNAVAILABLE,
          expectedDefaultMessage: 'Service unavailable',
        },
        {
          Ctor: GatewayTimeoutException,
          expectedStatus: HTTPStatusCode.GATEWAY_TIMEOUT,
          expectedDefaultMessage: 'Gateway timeout',
        },
        {
          Ctor: HttpVersionNotSupportedException,
          expectedStatus: HTTPStatusCode.HTTP_VERSION_NOT_SUPPORTED,
          expectedDefaultMessage: 'HTTP version not supported',
        },
        {
          Ctor: VariantAlsoNegotiatesException,
          expectedStatus: HTTPStatusCode.VARIANT_ALSO_NEGOTIATES,
          expectedDefaultMessage: 'Variant also negotiates',
        },
        {
          Ctor: InsufficientStorageException,
          expectedStatus: HTTPStatusCode.INSUFFICIENT_STORAGE,
          expectedDefaultMessage: 'Insufficient storage',
        },
        {
          Ctor: LoopDetectedException,
          expectedStatus: HTTPStatusCode.LOOP_DETECTED,
          expectedDefaultMessage: 'Loop detected',
        },
        {
          Ctor: NotExtendedException,
          expectedStatus: HTTPStatusCode.NOT_EXTENDED,
          expectedDefaultMessage: 'Not extended',
        },
        {
          Ctor: NetworkAuthenticationRequiredException,
          expectedStatus: HTTPStatusCode.NETWORK_AUTHENTICATION_REQUIRED,
          expectedDefaultMessage: 'Network authentication required',
        },
      ];

      for (const { Ctor, expectedStatus, expectedDefaultMessage } of cases) {
        const exception = new Ctor();
        expect(exception).toBeInstanceOf(HTTPException);
        expect(exception.statusCode).toBe(expectedStatus);
        expect(exception.message).toBe(expectedDefaultMessage);
      }
    });

    it('should construct TooManyRequestsException with retryAfterSeconds', () => {
      const exception = new TooManyRequestsException('Slow down', 30);
      expect(exception.statusCode).toBe(HTTPStatusCode.TOO_MANY_REQUESTS);
      expect(exception.message).toBe('Slow down');
      expect(exception.retryAfterSeconds).toBe(30);
    });

    it('should use default message for TooManyRequestsException when none provided', () => {
      const exception = new TooManyRequestsException();
      expect(exception.statusCode).toBe(HTTPStatusCode.TOO_MANY_REQUESTS);
      expect(exception.message).toBe('Too many requests');
    });
  });

  describe('RedirectException behavior', () => {
    it('should set redirectUrl and default message for TemporaryRedirectException', () => {
      const exception = new TemporaryRedirectException('https://example.com/temp');
      expect(exception).toBeInstanceOf(RedirectException);
      expect(exception.redirectUrl).toBe('https://example.com/temp');
      expect(exception.message).toBe('Temporary redirect to https://example.com/temp');
    });

    it('should allow custom message for TemporaryRedirectException', () => {
      const exception = new TemporaryRedirectException('https://example.com/temp', 'Go there temporarily');
      expect(exception.redirectUrl).toBe('https://example.com/temp');
      expect(exception.message).toBe('Go there temporarily');
    });

    it('should set redirectUrl and default message for PermanentRedirectException', () => {
      const exception = new PermanentRedirectException('https://example.com/permanent');
      expect(exception).toBeInstanceOf(RedirectException);
      expect(exception.redirectUrl).toBe('https://example.com/permanent');
      expect(exception.message).toBe('Permanent redirect to https://example.com/permanent');
    });

    it('should allow custom message for PermanentRedirectException', () => {
      const exception = new PermanentRedirectException('https://example.com/permanent', 'Go there permanently');
      expect(exception.redirectUrl).toBe('https://example.com/permanent');
      expect(exception.message).toBe('Go there permanently');
    });

    it('httpExceptionToResponse should handle non-basic HTTP exceptions using errorStatusCodes', () => {
      const exception = new ServiceUnavailableException('Service down');
      const response = httpExceptionToResponse(exception);

      expect(response.statusCode).toBe(HTTPStatusCode.SERVICE_UNAVAILABLE);
      expect(response.body).toEqual({ error: 'Service down' });
    });

    it('httpExceptionToResponse should handle TooManyRequestsException using errorStatusCodes', () => {
      const exception = new TooManyRequestsException();
      const response = httpExceptionToResponse(exception);

      expect(response.statusCode).toBe(HTTPStatusCode.TOO_MANY_REQUESTS);
      expect(response.body).toEqual({ error: 'Too many requests' });
    });
  });
});
