import { PolicyStatusVO } from './value-objects/policy-status.vo';
import { PremiumVO } from './value-objects/premium.vo';

/**
 * Domain entity: the presentation layer ALWAYS works with this
 * model (never with the raw backend DTO).
 */
export class PolicyEntity {
  constructor(
    readonly id: string,
    readonly policyNumber: string,
    readonly type: string,
    readonly status: PolicyStatusVO,
    readonly holderName: string,
    readonly premium: PremiumVO,
    readonly startDate: Date,
  ) {}

  get isActive(): boolean {
    return this.status.isActive();
  }

  get formattedStartDate(): string {
    return this.startDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
