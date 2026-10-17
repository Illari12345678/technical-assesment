import { Policy } from '../../domain/model/policy';
import { PolicyId } from '../../domain/model/value-objects/policy-id.vo';
import { PolicyNotFoundError } from '../../domain/errors/policy-not-found.error';
import { PolicyRepositoryPort } from '../../domain/ports/policy.repository.port';

export class GetPolicyByIdUseCase {
  constructor(private readonly policyRepository: PolicyRepositoryPort) {}

  async execute(policyId: string): Promise<Policy> {
    const policy = await this.policyRepository.findById(PolicyId.from(policyId));
    if (!policy) {
      throw new PolicyNotFoundError(policyId);
    }
    return policy;
  }
}
