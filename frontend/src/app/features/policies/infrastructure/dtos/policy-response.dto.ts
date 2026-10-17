/**
 * Exact replica of the JSON produced by the backend.
 * See docs/api-contract.md — any change starts here and in the backend
 * mapper, never in the presentation layer.
 */
export interface PremiumDto {
  amount: number;
  currency: string;
}

export interface PolicyResponseDto {
  id: string;
  policyNumber: string;
  type: string;
  status: string;
  holderName: string;
  premium: PremiumDto;
  startDate: string;
}

/** Envelope returned by `GET /api/policies` (filtering + pagination). */
export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedPoliciesDto {
  data: PolicyResponseDto[];
  meta: PaginationMetaDto;
}

/** Query params accepted by `GET /api/policies`. */
export interface PolicyQueryDto {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

/** Body for `POST /api/policies`. */
export interface CreatePolicyRequestDto {
  policyNumber: string;
  type: string;
  holderName: string;
  premium: PremiumDto;
  startDate: string;
  status?: string;
}

/** Body for `PUT /api/policies/:id` (policyNumber is immutable). */
export type UpdatePolicyRequestDto = Omit<CreatePolicyRequestDto, 'policyNumber'>;
