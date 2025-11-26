import { describe, expect, it } from 'vitest';
import * as z from 'zod';
import {
  BadRequestException,
  ForbiddenException,
  HTTPException,
  httpExceptionToResponse,
  InternalServerErrorException,
  isHTTPException,
  NotFoundException,
  RedirectException,
  UnauthorizedException,
} from './core/httpException.js';
import { isHTTPResponse } from './core/httpResponse.js';
import { HTTPStatusCode } from './core/statusCodes.js';
import { validateInput, validateOutput } from './core/validation.js';

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

    it('should create RedirectException with redirectUrl only', () => {
      const exception = new RedirectException('https://example.com');
      expect(exception).toBeInstanceOf(RedirectException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.statusCode).toBe(HTTPStatusCode.REDIRECT);
      expect(exception.redirectUrl).toBe('https://example.com');
      expect(exception.message).toBe('Redirect to $redirectUrl');
      expect(exception.name).toBe('RedirectException');
    });

    it('should create RedirectException with redirectUrl and message', () => {
      const exception = new RedirectException('https://example.com', 'Custom redirect message');
      expect(exception).toBeInstanceOf(RedirectException);
      expect(exception.statusCode).toBe(HTTPStatusCode.REDIRECT);
      expect(exception.redirectUrl).toBe('https://example.com');
      expect(exception.message).toBe('Custom redirect message');
    });
  });

  describe('validateInput', () => {
    it('should return validated data for valid input', () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      const input = { name: 'John', age: 30 };

      const result = validateInput(schema, input);

      expect(result).toEqual(input);
    });

    it('should throw BadRequestException for invalid input', () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      const input = { name: 'John', age: 'thirty' };

      expect(() => validateInput(schema, input)).toThrow(BadRequestException);
      expect(() => validateInput(schema, input)).toThrow('age: Expected number, received string');
    });

    it('should throw BadRequestException with multiple errors', () => {
      const schema = z.object({ name: z.string().min(3), age: z.number().min(0) });
      const input = { name: 'Jo', age: -5 };

      expect(() => validateInput(schema, input)).toThrow(BadRequestException);
      try {
        validateInput(schema, input);
      } catch (error) {
        if (error instanceof BadRequestException) {
          expect(error.message).toContain('name');
          expect(error.message).toContain('age');
        }
      }
    });

    it('should handle nested object validation errors', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      });
      const input = { user: { name: 'John', email: 'invalid-email' } };

      expect(() => validateInput(schema, input)).toThrow(BadRequestException);
      try {
        validateInput(schema, input);
      } catch (error) {
        if (error instanceof BadRequestException) {
          expect(error.message).toContain('email');
        }
      }
    });
  });

  describe('validateOutput', () => {
    it('should return validated data for valid output', () => {
      const schema = z.object({ id: z.string(), count: z.number() });
      const output = { id: '123', count: 42 };

      const result = validateOutput(schema, output);

      expect(result).toEqual(output);
    });

    it('should throw InternalServerErrorException for invalid output', () => {
      const schema = z.object({ id: z.string(), count: z.number() });
      const output = { id: '123', count: 'not-a-number' };

      expect(() => validateOutput(schema, output)).toThrow(InternalServerErrorException);
      expect(() => validateOutput(schema, output)).toThrow('Failed to validate output');
    });

    it('should throw InternalServerErrorException with multiple errors', () => {
      const schema = z.object({ id: z.string().uuid(), count: z.number().positive() });
      const output = { id: 'not-uuid', count: -1 };

      expect(() => validateOutput(schema, output)).toThrow(InternalServerErrorException);
      try {
        validateOutput(schema, output);
      } catch (error) {
        if (error instanceof InternalServerErrorException) {
          expect(error.message).toContain('Failed to validate output');
          expect(error.message).toContain('id');
          expect(error.message).toContain('count');
        }
      }
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

    it('should convert RedirectException to response', () => {
      const exception = new RedirectException('https://example.com');
      const response = httpExceptionToResponse(exception);

      expect(response.statusCode).toBe(HTTPStatusCode.REDIRECT);
      expect('redirectUrl' in response && response.redirectUrl).toBe('https://example.com');
    });

    it('should handle unknown status codes with fallback', () => {
      class UnknownException extends HTTPException {
        readonly statusCode = 418;
      }
      const exception = new UnknownException('Teapot error');
      const response = httpExceptionToResponse(exception);

      expect(response.statusCode).toBe(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      if ('body' in response) {
        expect(response.body).toEqual({ error: 'Teapot error' });
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
      expect(isHTTPException(new RedirectException('https://example.com'))).toBe(true);
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

  describe('isHTTPResponse', () => {
    it('should return true for valid HTTPResponse objects', () => {
      expect(isHTTPResponse({ statusCode: 200, body: {} })).toBe(true);
      expect(isHTTPResponse({ statusCode: 201, body: {} })).toBe(true);
      expect(isHTTPResponse({ statusCode: 204 })).toBe(true);
      expect(isHTTPResponse({ statusCode: 302, redirectUrl: 'https://example.com' })).toBe(true);
      expect(isHTTPResponse({ statusCode: 400, body: { error: 'test' } })).toBe(true);
      expect(isHTTPResponse({ statusCode: 401, body: { error: 'test' } })).toBe(true);
      expect(isHTTPResponse({ statusCode: 403, body: { error: 'test' } })).toBe(true);
      expect(isHTTPResponse({ statusCode: 404, body: { error: 'test' } })).toBe(true);
      expect(isHTTPResponse({ statusCode: 500, body: { error: 'test' } })).toBe(true);
    });

    it('should return false for invalid responses', () => {
      expect(isHTTPResponse({ statusCode: 999 })).toBe(false);
      expect(isHTTPResponse({ statusCode: '200' })).toBe(false);
      expect(isHTTPResponse({})).toBe(false);
      expect(isHTTPResponse(null)).toBe(false);
      expect(isHTTPResponse(undefined)).toBe(false);
      expect(isHTTPResponse('string')).toBe(false);
    });
  });
});
