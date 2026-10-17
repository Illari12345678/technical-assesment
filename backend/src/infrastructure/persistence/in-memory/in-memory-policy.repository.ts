import { Policy } from '../../../domain/model/policy';
import { PolicyId } from '../../../domain/model/value-objects/policy-id.vo';
import {
  PaginatedResult,
  PolicyQuery,
  PolicyRepositoryPort,
} from '../../../domain/ports/policy.repository.port';
import { PolicyMapper, PolicyRecord } from '../mapper/policy.mapper';
import { POLICY_SEED } from './policy-seed';

/**
 * Secondary adapter: in-memory repository with seed data.
 * PolicyMapper performs the record → entity mapping.
 */
export class InMemoryPolicyRepository implements PolicyRepositoryPort {
  private readonly records: PolicyRecord[];

  constructor(records: PolicyRecord[] = POLICY_SEED) {
    this.records = [...records];
  }

  async findAll(query: PolicyQuery): Promise<PaginatedResult<Policy>> {
    const holderName = query.holderName?.trim().toUpperCase();

    const filtered = this.records.filter(
      (record) =>
        (query.status === undefined || record.status === query.status) &&
        (query.type === undefined || record.type === query.type) &&
        (holderName === undefined || record.holderName.toUpperCase().includes(holderName)),
    );

    const start = (query.page - 1) * query.limit;
    const page = filtered.slice(start, start + query.limit);

    return { items: page.map(PolicyMapper.toDomain), total: filtered.length };
  }

  async findById(id: PolicyId): Promise<Policy | null> {
    const record = this.records.find((candidate) => candidate.id === id.toString());
    return record ? PolicyMapper.toDomain(record) : null;
  }

  async findByNumber(policyNumber: string): Promise<Policy | null> {
    const normalized = policyNumber.trim().toUpperCase();
    const record = this.records.find(
      (candidate) => candidate.policyNumber.toUpperCase() === normalized,
    );
    return record ? PolicyMapper.toDomain(record) : null;
  }

  async save(policy: Policy): Promise<void> {
    this.records.push(PolicyMapper.toRecord(policy));
  }

  async update(policy: Policy): Promise<void> {
    const index = this.records.findIndex((candidate) => candidate.id === policy.id.toString());
    if (index === -1) {
      throw new Error(`Cannot update policy '${policy.id.toString()}': not persisted`);
    }
    this.records[index] = PolicyMapper.toRecord(policy);
  }
}
