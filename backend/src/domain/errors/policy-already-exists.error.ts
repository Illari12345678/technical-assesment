import { DomainError } from './domain.error';

/** A policy with the given business key already exists. */
export class PolicyAlreadyExistsError extends DomainError {
  override readonly code = 'POLICY_ALREADY_EXISTS' as const;
  override readonly statusCode = 422;

  constructor(readonly policyNumber: string) {
    super(`A policy with number '${policyNumber}' already exists`);
  }
}
