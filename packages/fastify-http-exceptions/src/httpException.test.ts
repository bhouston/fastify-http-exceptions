import { describe, expect, it } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  HTTPException,
  httpExceptionToResponse,
  InternalServerErrorException,
  isHTTPException,
  NotFoundException,
  PermanentRedirectException,
  TemporaryRedirectException,
  UnauthorizedException,
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
  });
});
