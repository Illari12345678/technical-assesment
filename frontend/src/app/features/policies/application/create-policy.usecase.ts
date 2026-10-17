import { Observable } from 'rxjs';
import { PolicyEntity } from '../domain/models/policy.entity';
import { NewPolicy } from '../domain/models/policy-input';
import { PolicyRepository } from '../domain/repositories/policy.repository';

export class CreatePolicyUseCase {
  constructor(private readonly policyRepository: PolicyRepository) {}

  execute(policy: NewPolicy): Observable<PolicyEntity> {
    return this.policyRepository.create(policy);
  }
}
