import { DomainError } from './domain.error';

/**
 * Domain invariant violated while building/mutating the aggregate.
 * Input *shape* is validated at the HTTP edge (Zod → 400); this error covers
 * rules that only the domain can enforce (→ 422).
 */
export class InvalidPolicyDataError extends DomainError {
  override readonly code = 'INVALID_POLICY_DATA' as const;
  override readonly statusCode = 422;

  constructor(message: string) {
    super(message);
  }
}
