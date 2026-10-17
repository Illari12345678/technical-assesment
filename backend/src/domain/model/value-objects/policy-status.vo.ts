export const POLICY_STATUSES = ['ACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED'] as const;

export type PolicyStatusValue = (typeof POLICY_STATUSES)[number];

/**
 * Allowed lifecycle transitions per source status.
 * CANCELLED and EXPIRED are terminal: no outgoing transitions.
 */
const ALLOWED_TRANSITIONS: Record<PolicyStatusValue, readonly PolicyStatusValue[]> = {
  PENDING: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['CANCELLED', 'EXPIRED'],
  CANCELLED: [],
  EXPIRED: [],
};

/**
 * Value Object: policy lifecycle status.
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

  isTerminal(): boolean {
    return ALLOWED_TRANSITIONS[this.value].length === 0;
  }

  /** Same status is always allowed (idempotent update); otherwise the move must be declared. */
  canTransitionTo(next: PolicyStatus): boolean {
    return this.equals(next) || ALLOWED_TRANSITIONS[this.value].includes(next.value);
  }

  equals(other: PolicyStatus): boolean {
    return this.value === other.value;
  }

  toString(): PolicyStatusValue {
    return this.value;
  }
}
