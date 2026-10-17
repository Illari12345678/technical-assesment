import { Policy } from '../model/policy';
import { PolicyId } from '../model/value-objects/policy-id.vo';
import { PolicyStatusValue } from '../model/value-objects/policy-status.vo';
import { PolicyTypeValue } from '../model/value-objects/policy-type.vo';

/** Filtering + pagination criteria accepted by `findAll`. */
export interface PolicyQuery {
  status?: PolicyStatusValue;
  type?: PolicyTypeValue;
  /** Case-insensitive partial match on the holder name. */
  holderName?: string;
  page: number;
  limit: number;
}

/** Generic paginated slice returned by the repository. */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

/**
 * Secondary output port: the domain defines WHAT needs persisting;
 * the infrastructure decides HOW.
 */
export interface PolicyRepositoryPort {
  findAll(query: PolicyQuery): Promise<PaginatedResult<Policy>>;
  findById(id: PolicyId): Promise<Policy | null>;
  findByNumber(policyNumber: string): Promise<Policy | null>;
  save(policy: Policy): Promise<void>;
  update(policy: Policy): Promise<void>;
}
