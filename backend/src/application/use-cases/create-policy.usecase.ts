import { PolicyAlreadyExistsError } from '../../domain/errors/policy-already-exists.error';
import { Policy } from '../../domain/model/policy';
import { PolicyRepositoryPort } from '../../domain/ports/policy.repository.port';

export interface CreatePolicyInput {
  policyNumber: string;
  type: string;
  holderName: string;
  premium: { amount: number; currency: string };
  startDate: Date;
  status?: string;
}

export class CreatePolicyUseCase {
  constructor(private readonly policyRepository: PolicyRepositoryPort) {}

  async execute(input: CreatePolicyInput): Promise<Policy> {
    const existing = await this.policyRepository.findByNumber(input.policyNumber);
    if (existing) {
      throw new PolicyAlreadyExistsError(input.policyNumber);
    }

    const policy = Policy.create(input);
    await this.policyRepository.save(policy);
    return policy;
  }
}
