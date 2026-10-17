import { Policy } from '../../domain/model/policy';
import { PolicyStatusValue } from '../../domain/model/value-objects/policy-status.vo';
import { PolicyTypeValue } from '../../domain/model/value-objects/policy-type.vo';
import {
  PaginatedResult,
  PolicyRepositoryPort,
} from '../../domain/ports/policy.repository.port';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

export interface ListPoliciesInput {
  status?: PolicyStatusValue;
  type?: PolicyTypeValue;
  holderName?: string;
  page?: number;
  limit?: number;
}

export class GetAllPoliciesUseCase {
  constructor(private readonly policyRepository: PolicyRepositoryPort) {}

  async execute(input: ListPoliciesInput = {}): Promise<PaginatedResult<Policy>> {
    return this.policyRepository.findAll({
      status: input.status,
      type: input.type,
      holderName: input.holderName,
      page: input.page ?? DEFAULT_PAGE,
      limit: input.limit ?? DEFAULT_LIMIT,
    });
  }
}
