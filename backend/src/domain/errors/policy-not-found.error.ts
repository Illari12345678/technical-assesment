import { DomainError } from './domain.error';

export class PolicyNotFoundError extends DomainError {
  override readonly code = 'POLICY_NOT_FOUND' as const;
  override readonly statusCode = 404;

  constructor(readonly policyId: string) {
    super(`Policy with id '${policyId}' was not found`);
  }
}
