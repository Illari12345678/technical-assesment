import { Policy } from '../../domain/model/policy';
import { PolicyRepositoryPort } from '../../domain/ports/policy.repository.port';

export class GetAllPoliciesUseCase {
  constructor(private readonly policyRepository: PolicyRepositoryPort) {}

  async execute(): Promise<Policy[]> {
    return this.policyRepository.findAll();
  }
}
