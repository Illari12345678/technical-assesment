import { Policy } from '../../../domain/model/policy';
import { PolicyId } from '../../../domain/model/value-objects/policy-id.vo';
import { PolicyType } from '../../../domain/model/value-objects/policy-type.vo';
import { PolicyStatus } from '../../../domain/model/value-objects/policy-status.vo';
import { Premium } from '../../../domain/model/value-objects/premium.vo';

/** Forma cruda persistida (registro) — espejo del JSON de la API. */
export interface PolicyRecord {
  id: string;
  policyNumber: string;
  type: string;
  status: string;
  holderName: string;
  premium: { amount: number; currency: string };
  startDate: string;
}

export interface PolicyResponseDto {
  id: string;
  policyNumber: string;
  type: string;
  status: string;
  holderName: string;
  premium: { amount: number; currency: string };
  startDate: string;
}

/**
 * Mapper between the persisted (or API) shape and the domain aggregate.
 * The single place that knows the JSON shape — see docs/api-contract.md.
 */
export class PolicyMapper {
  static toDomain(record: PolicyRecord): Policy {
    return Policy.reconstitute({
      id: PolicyId.from(record.id),
      policyNumber: record.policyNumber,
      type: PolicyType.from(record.type),
      status: PolicyStatus.from(record.status),
      holderName: record.holderName,
      premium: Premium.create(record.premium.amount, record.premium.currency),
      startDate: new Date(record.startDate),
    });
  }

  static toResponseDto(policy: Policy): PolicyResponseDto {
    return {
      id: policy.id.toString(),
      policyNumber: policy.policyNumber,
      type: policy.type.toString(),
      status: policy.status.toString(),
      holderName: policy.holderName,
      premium: policy.premium.toJSON(),
      startDate: policy.startDate.toISOString().slice(0, 10),
    };
  }
}
