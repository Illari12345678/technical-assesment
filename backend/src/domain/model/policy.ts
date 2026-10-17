import { InvalidPolicyDataError } from '../errors/invalid-policy-data.error';
import { InvalidStatusTransitionError } from '../errors/invalid-status-transition.error';
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

/** Input accepted by `Policy.create` (raw strings, as they arrive from the edge). */
export interface CreatePolicyProps {
  policyNumber: string;
  type: string;
  holderName: string;
  premium: { amount: number; currency: string };
  startDate: Date;
  status?: string;
}

/** Mutable fields accepted by `updateDetails`; everything is optional (full or partial). */
export interface UpdatePolicyProps {
  type?: string;
  holderName?: string;
  premium?: { amount: number; currency: string };
  startDate?: Date;
  status?: string;
}

/**
 * Wraps value-object construction so that a domain invariant violation is
 * reported as a 422 domain error instead of an unhandled 500.
 */
const wrapInvalidData = <T>(build: () => T): T => {
  try {
    return build();
  } catch (error) {
    throw new InvalidPolicyDataError(error instanceof Error ? error.message : 'Invalid policy data');
  }
};

const assertNonEmpty = (value: string, field: string): string => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new InvalidPolicyDataError(`${field} cannot be empty`);
  }
  return trimmed;
};

const assertValidDate = (value: Date): Date => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new InvalidPolicyDataError('startDate must be a valid date');
  }
  return value;
};

/**
 * Root aggregate: Policy. Immutable except for status transitions.
 */
export class Policy {
  private constructor(private readonly props: PolicyProps) {}

  /** Creation factory: applies the invariants that `reconstitute` deliberately skips. */
  static create(props: CreatePolicyProps): Policy {
    return new Policy({
      id: PolicyId.create(),
      policyNumber: assertNonEmpty(String(props.policyNumber ?? ''), 'policyNumber'),
      type: wrapInvalidData(() => PolicyType.from(props.type)),
      status: props.status
        ? wrapInvalidData(() => PolicyStatus.from(props.status as string))
        : PolicyStatus.pending(),
      holderName: assertNonEmpty(String(props.holderName ?? ''), 'holderName'),
      premium: wrapInvalidData(() => Premium.create(props.premium.amount, props.premium.currency)),
      startDate: assertValidDate(props.startDate),
    });
  }

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

  /**
   * Applies the mutable fields (policyNumber and id are immutable business keys).
   * Any provided value is re-validated through the value objects.
   */
  updateDetails(props: UpdatePolicyProps): void {
    if (props.type !== undefined) {
      this.props.type = wrapInvalidData(() => PolicyType.from(props.type as string));
    }
    if (props.holderName !== undefined) {
      this.props.holderName = assertNonEmpty(props.holderName, 'holderName');
    }
    if (props.premium !== undefined) {
      this.props.premium = wrapInvalidData(() =>
        Premium.create(props.premium!.amount, props.premium!.currency),
      );
    }
    if (props.startDate !== undefined) {
      this.props.startDate = assertValidDate(props.startDate);
    }
    if (props.status !== undefined) {
      this.changeStatus(wrapInvalidData(() => PolicyStatus.from(props.status as string)));
    }
  }

  /** Domain rule: only the transitions declared in the lifecycle are allowed. */
  changeStatus(next: PolicyStatus): void {
    if (!this.props.status.canTransitionTo(next)) {
      throw new InvalidStatusTransitionError(
        this.props.policyNumber,
        this.props.status.toString(),
        next.toString(),
      );
    }
    this.props.status = next;
  }
}
