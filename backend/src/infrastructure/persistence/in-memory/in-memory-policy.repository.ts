import { Policy } from '../../../domain/model/policy';
import { PolicyId } from '../../../domain/model/value-objects/policy-id.vo';
import { PolicyRepositoryPort } from '../../../domain/ports/policy.repository.port';
import { PolicyMapper, PolicyRecord } from '../mapper/policy.mapper';
import { POLICY_SEED } from './policy-seed';

/**
 * Adaptador secundario: repositorio en memoria con datos seed.
 * El mapeo record → entidad lo realiza PolicyMapper.
 */
export class InMemoryPolicyRepository implements PolicyRepositoryPort {
  private readonly records: PolicyRecord[];

  constructor(records: PolicyRecord[] = POLICY_SEED) {
    this.records = [...records];
  }

  async findAll(): Promise<Policy[]> {
    return this.records.map(PolicyMapper.toDomain);
  }

  async findById(id: PolicyId): Promise<Policy | null> {
    const record = this.records.find((candidate) => candidate.id === id.toString());
    return record ? PolicyMapper.toDomain(record) : null;
  }
}
