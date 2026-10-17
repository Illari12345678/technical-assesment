import { Observable } from 'rxjs';
import { PolicyEntity } from '../domain/models/policy.entity';
import { PolicyRepository } from '../domain/repositories/policy.repository';

export class GetAllPoliciesUseCase {
  constructor(private readonly policyRepository: PolicyRepository) {}

  execute(): Observable<PolicyEntity[]> {
    return this.policyRepository.findAll();
  }
}
