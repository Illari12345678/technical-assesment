import { PolicyId } from './value-objects/policy-id.vo';
import { PolicyType } from './value-objects/policy-type.vo';
import { PolicyStatus } from './value-objects/policy-status.vo';
import { Premium } from './value-objects/premium.vo';

export interface PolicyProps {
  id: PolicyId;
  policyNumber: string;
  type: PolicyType;
  status: PolicyStatus;
  holderName: string;
  premium: Premium;
  startDate: Date;
}

/**
 * Agregado raíz: Póliza. Inmutable salvo por transiciones de estado.
 */
export class Policy {
  private constructor(
    private readonly props: PolicyProps,
  ) {}

  /** Reconstrucción desde persistencia (sin reglas de creación). */
  static reconstitute(props: PolicyProps): Policy {
    if (props.policyNumber.trim().length === 0) {
      throw new Error('Policy number cannot be empty');
    }
    if (props.holderName.trim().length === 0) {
      throw new Error('Holder name cannot be empty');
    }
    return new Policy({ ...props });
  }

  get id(): PolicyId {
    return this.props.id;
  }

  get policyNumber(): string {
    return this.props.policyNumber;
  }

  get type(): PolicyType {
    return this.props.type;
  }

  get status(): PolicyStatus {
    return this.props.status;
  }

  get holderName(): string {
    return this.props.holderName;
  }

  get premium(): Premium {
    return this.props.premium;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  isActive(): boolean {
    return this.props.status.isActive();
  }

  /** Regla de dominio: solo una póliza vigente puede pasar a cancelada. */
  cancel(): void {
    if (!this.isActive()) {
      throw new Error(
        `Only ACTIVE policies can be cancelled, policy '${this.policyNumber}' is ${this.status.toString()}`,
      );
    }
    this.props.status = PolicyStatus.cancelled();
  }
}
