import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError, isApiError } from './api-error';

const toApiError = (error: HttpErrorResponse): ApiError => {
  if (isApiError(error.error)) {
    return error.error;
  }
  if (error.status === 0) {
    return {
      statusCode: 0,
      code: 'NETWORK_ERROR',
      message: 'No se pudo contactar con el servidor',
    };
  }
  return {
    statusCode: error.status,
    code: 'HTTP_ERROR',
    message: error.message || 'Ha ocurrido un error inesperado',
  };
};

/**
 * Normalises every HTTP failure into the shared `ApiError` shape so the
 * application layers never deal with raw `HttpErrorResponse`s.
 */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) =>
      throwError(() => (error instanceof HttpErrorResponse ? toApiError(error) : error)),
    ),
  );
