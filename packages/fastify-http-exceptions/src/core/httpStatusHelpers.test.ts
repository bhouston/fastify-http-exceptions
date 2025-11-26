import { describe, expect, it } from 'vitest';
import {
  createErrorBody,
  errorStatusCodes,
  formatForbiddenMessage,
  formatNotFoundMessage,
} from './httpStatusHelpers.js';
import { HTTPStatusCode } from './statusCodes.js';

describe('httpStatusHelpers', () => {
  describe('formatForbiddenMessage', () => {
    it('should format forbidden message without reason', () => {
      expect(formatForbiddenMessage('resource')).toBe('Access denied to resource');
    });

    it('should format forbidden message with reason', () => {
      expect(formatForbiddenMessage('resource', 'because reasons')).toBe('Access denied to resource: because reasons');
    });
  });

  describe('formatNotFoundMessage', () => {
    it('should format not found message without reason', () => {
      expect(formatNotFoundMessage('user')).toBe('user not found');
    });

    it('should format not found message with reason', () => {
      expect(formatNotFoundMessage('user', 'deleted')).toBe('user not found: deleted');
    });
  });

  describe('createErrorBody', () => {
    it('should wrap message in error body', () => {
      expect(createErrorBody('Something went wrong')).toEqual({ error: 'Something went wrong' });
    });
  });

  describe('errorStatusCodes', () => {
    it('should include representative 4xx and 5xx error codes', () => {
      expect(errorStatusCodes).toContain(HTTPStatusCode.BAD_REQUEST);
      expect(errorStatusCodes).toContain(HTTPStatusCode.UNAUTHORIZED);
      expect(errorStatusCodes).toContain(HTTPStatusCode.NOT_FOUND);
      expect(errorStatusCodes).toContain(HTTPStatusCode.INTERNAL_SERVER_ERROR);
      expect(errorStatusCodes).toContain(HTTPStatusCode.SERVICE_UNAVAILABLE);
      expect(errorStatusCodes).toContain(HTTPStatusCode.TOO_MANY_REQUESTS);
    });
  });
});
