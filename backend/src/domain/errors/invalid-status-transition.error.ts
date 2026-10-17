import { DomainError } from './domain.error';

/** The requested status change is not allowed by the policy lifecycle. */
export class InvalidStatusTransitionError extends DomainError {
  override readonly code = 'INVALID_STATUS_TRANSITION' as const;
  override readonly statusCode = 422;

  constructor(
    readonly policyNumber: string,
    readonly from: string,
    readonly to: string,
  ) {
    super(`Cannot change policy '${policyNumber}' status from ${from} to ${to}`);
  }
}
