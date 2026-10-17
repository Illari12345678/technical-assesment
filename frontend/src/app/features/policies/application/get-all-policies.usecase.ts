import { Observable } from 'rxjs';
import { PolicyPage } from '../domain/models/policy-page';
import { PolicyQuery } from '../domain/models/policy-query';
import { PolicyRepository } from '../domain/repositories/policy.repository';

export class GetAllPoliciesUseCase {
  constructor(private readonly policyRepository: PolicyRepository) {}

  execute(query: PolicyQuery = {}): Observable<PolicyPage> {
    return this.policyRepository.findAll(query);
  }
}
