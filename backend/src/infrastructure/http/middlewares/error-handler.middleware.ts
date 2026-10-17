import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { DomainError } from '../../../domain/errors/domain.error';
import { LoggerPort } from '../../../domain/ports/logger.port';

/**
 * Middleware centralizado: todos los errores salen con el mismo formato
 * `{ statusCode, code, message }` (ver docs/api-contract.md).
 */
export const errorHandler = (logger: LoggerPort): ErrorRequestHandler => {
  return (error, _req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    if (error instanceof ZodError) {
      res.status(400).json({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        details: error.flatten(),
      });
      return;
    }

    if (error instanceof DomainError) {
      logger.warn('Domain error handled', { code: error.code, message: error.message });
      res.status(error.statusCode).json({
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
      });
      return;
    }

    logger.error('Unhandled error', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
  };
};
