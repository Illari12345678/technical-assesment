export const POLICY_STATUSES = ['ACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED'] as const;

export type PolicyStatusValue = (typeof POLICY_STATUSES)[number];

const STATUS_LABELS: Record<PolicyStatusValue, string> = {
  ACTIVE: 'Activa',
  PENDING: 'Pendiente',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Caducada',
};

/**
 * Value Object: estado del ciclo de vida de la póliza.
 */
export class PolicyStatusVO {
  private constructor(readonly value: PolicyStatusValue) {}

  static from(value: string): PolicyStatusVO {
    const normalized = value.trim().toUpperCase();
    if (!(POLICY_STATUSES as readonly string[]).includes(normalized)) {
      throw new Error(
        `Invalid policy status '${value}'. Allowed values: ${POLICY_STATUSES.join(', ')}`,
      );
    }
    return new PolicyStatusVO(normalized as PolicyStatusValue);
  }

  isActive(): boolean {
    return this.value === 'ACTIVE';
  }

  get label(): string {
    return STATUS_LABELS[this.value];
  }
}
