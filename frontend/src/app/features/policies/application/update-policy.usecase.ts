import { Observable } from 'rxjs';
import { PolicyEntity } from '../domain/models/policy.entity';
import { PolicyChanges } from '../domain/models/policy-input';
import { PolicyRepository } from '../domain/repositories/policy.repository';

export class UpdatePolicyUseCase {
  constructor(private readonly policyRepository: PolicyRepository) {}

  execute(id: string, changes: PolicyChanges): Observable<PolicyEntity> {
    return this.policyRepository.update(id, changes);
  }
}
