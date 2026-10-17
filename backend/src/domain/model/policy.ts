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
 * Root aggregate: Policy. Immutable except for status transitions.
 */
export class Policy {
  private constructor(
    private readonly props: PolicyProps,
  ) {}

  /** Reconstitution from persistence (bypasses creation rules). */
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

  /** Domain rule: only an ACTIVE policy can be cancelled. */
  cancel(): void {
    if (!this.isActive()) {
      throw new Error(
        `Only ACTIVE policies can be cancelled, policy '${this.policyNumber}' is ${this.status.toString()}`,
      );
    }
    this.props.status = PolicyStatus.cancelled();
  }
}
