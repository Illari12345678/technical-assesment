/**
 * Normalised API error shape, matching the backend contract
 * (`{ statusCode, code, message }` — see docs/api-contract.md).
 */
export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
}

export const isApiError = (value: unknown): value is ApiError => {
  const candidate = value as Partial<ApiError> | null;
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    typeof candidate.statusCode === 'number' &&
    typeof candidate.code === 'string' &&
    typeof candidate.message === 'string'
  );
};
