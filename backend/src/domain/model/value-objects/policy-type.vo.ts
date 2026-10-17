export const POLICY_TYPES = ['AUTO', 'HOME', 'LIFE', 'HEALTH', 'TRAVEL'] as const;

export type PolicyTypeValue = (typeof POLICY_TYPES)[number];

/**
 * Value Object: tipo de cobertura de la póliza.
 */
export class PolicyType {
  private constructor(private readonly value: PolicyTypeValue) {}

  static from(value: string): PolicyType {
    const normalized = value.trim().toUpperCase();
    if (!POLICY_TYPES.includes(normalized as PolicyTypeValue)) {
      throw new Error(
        `Invalid policy type '${value}'. Allowed values: ${POLICY_TYPES.join(', ')}`,
      );
    }
    return new PolicyType(normalized as PolicyTypeValue);
  }

  equals(other: PolicyType): boolean {
    return this.value === other.value;
  }

  toString(): PolicyTypeValue {
    return this.value;
  }
}
