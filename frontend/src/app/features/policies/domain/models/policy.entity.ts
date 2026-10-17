import { PolicyStatusVO } from './value-objects/policy-status.vo';
import { PremiumVO } from './value-objects/premium.vo';

/**
 * Entidad de dominio: la capa de presentación trabaja SIEMPRE con este
 * modelo (nunca con el DTO crudo del backend).
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
