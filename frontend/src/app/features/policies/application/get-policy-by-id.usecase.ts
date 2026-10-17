import { Observable } from 'rxjs';
import { PolicyEntity } from '../domain/models/policy.entity';
import { PolicyRepository } from '../domain/repositories/policy.repository';

export class GetPolicyByIdUseCase {
  constructor(private readonly policyRepository: PolicyRepository) {}

  execute(id: string): Observable<PolicyEntity> {
    return this.policyRepository.findById(id);
  }
}
