import { PolicyNotFoundError } from '../../domain/errors/policy-not-found.error';
import { Policy } from '../../domain/model/policy';
import { PolicyId } from '../../domain/model/value-objects/policy-id.vo';
import { PolicyRepositoryPort } from '../../domain/ports/policy.repository.port';

export interface UpdatePolicyInput {
  type: string;
  holderName: string;
  premium: { amount: number; currency: string };
  startDate: Date;
  status?: string;
}

export class UpdatePolicyUseCase {
  constructor(private readonly policyRepository: PolicyRepositoryPort) {}

  async execute(policyId: string, input: UpdatePolicyInput): Promise<Policy> {
    const policy = await this.policyRepository.findById(PolicyId.from(policyId));
    if (!policy) {
      throw new PolicyNotFoundError(policyId);
    }

    policy.updateDetails(input);
    await this.policyRepository.update(policy);
    return policy;
  }
}
