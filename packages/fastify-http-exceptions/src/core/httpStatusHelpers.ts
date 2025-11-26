import { HTTPStatusCode } from './statusCodes.js';

export type ExceptionResource =
  | 'user'
  | 'asset'
  | 'project'
  | 'org'
  | 'member invite'
  | 'member'
  | 'file'
  | 'asset version'
  | 'asset version file'
  | 'comment'
  | 'service account'
  | 'API token'
  | 'task'
  | 'taskRun'
  | 'report'
  | 'user request';

export function formatForbiddenMessage(resource: ExceptionResource, reason?: string): string {
  let message = `Access denied to ${resource}`;
  if (reason) {
    message += `: ${reason}`;
  }
  return message;
}

export function formatNotFoundMessage(resource: ExceptionResource, reason?: string): string {
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
  HTTPStatusCode.BAD_REQUEST,
  HTTPStatusCode.UNAUTHORIZED,
  HTTPStatusCode.FORBIDDEN,
  HTTPStatusCode.NOT_FOUND,
  HTTPStatusCode.INTERNAL_SERVER_ERROR,
] as const;
