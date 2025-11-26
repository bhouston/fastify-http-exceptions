export type HTTPStatusCode = 200 | 201 | 204 | 302 | 304 | 400 | 401 | 403 | 404 | 406 | 500;

export const HTTPStatusCode = {
  OK: 200 as const,
  CREATED: 201 as const,
  NO_CONTENT: 204 as const,
  REDIRECT: 302 as const,
  NOT_MODIFIED: 304 as const,
  BAD_REQUEST: 400 as const,
  UNAUTHORIZED: 401 as const,
  FORBIDDEN: 403 as const,
  NOT_FOUND: 404 as const,
  NOT_ACCEPTABLE: 406 as const,
  INTERNAL_SERVER_ERROR: 500 as const,
} as const;
