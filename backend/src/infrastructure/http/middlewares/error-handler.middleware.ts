import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { DomainError } from '../../../domain/errors/domain.error';
import { LoggerPort } from '../../../domain/ports/logger.port';

/** Uniform 404 for any unmatched `/api/*` route. */
export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    statusCode: 404,
    code: 'ROUTE_NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} was not found`,
  });
};

/** Body-parser rejects malformed JSON with a SyntaxError carrying `type`. */
const isJsonParseError = (error: unknown): boolean =>
  error instanceof SyntaxError && (error as { type?: string }).type === 'entity.parse.failed';

/**
 * Centralized middleware: every error responds with the same shape
 * `{ statusCode, code, message }` (see docs/api-contract.md).
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

    if (isJsonParseError(error)) {
      res.status(400).json({
        statusCode: 400,
        code: 'INVALID_JSON',
        message: 'Request body is not valid JSON',
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
