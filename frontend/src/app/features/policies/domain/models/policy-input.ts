/** Data required to create a policy (domain input, not the wire DTO). */
export interface NewPolicy {
  policyNumber: string;
  type: string;
  holderName: string;
  premium: { amount: number; currency: string };
  startDate: string;
  status?: string;
}

/** Mutable fields of an existing policy (policyNumber is immutable). */
export type PolicyChanges = Omit<NewPolicy, 'policyNumber'>;
