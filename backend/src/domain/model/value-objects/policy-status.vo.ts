export const POLICY_STATUSES = ['ACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED'] as const;

export type PolicyStatusValue = (typeof POLICY_STATUSES)[number];

/**
 * Value Object: estado del ciclo de vida de la póliza.
 */
export class PolicyStatus {
  private constructor(private readonly value: PolicyStatusValue) {}

  static from(value: string): PolicyStatus {
    const normalized = value.trim().toUpperCase();
    if (!POLICY_STATUSES.includes(normalized as PolicyStatusValue)) {
      throw new Error(
        `Invalid policy status '${value}'. Allowed values: ${POLICY_STATUSES.join(', ')}`,
      );
    }
    return new PolicyStatus(normalized as PolicyStatusValue);
  }

  static active(): PolicyStatus {
    return new PolicyStatus('ACTIVE');
  }

  static pending(): PolicyStatus {
    return new PolicyStatus('PENDING');
  }

  static cancelled(): PolicyStatus {
    return new PolicyStatus('CANCELLED');
  }

  static expired(): PolicyStatus {
    return new PolicyStatus('EXPIRED');
  }

  isActive(): boolean {
    return this.value === 'ACTIVE';
  }

  equals(other: PolicyStatus): boolean {
    return this.value === other.value;
  }

  toString(): PolicyStatusValue {
    return this.value;
  }
}
