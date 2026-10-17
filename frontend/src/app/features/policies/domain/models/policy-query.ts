import { PolicyStatusValue } from './value-objects/policy-status.vo';

/** Filtering + pagination criteria expressed in domain terms. */
export interface PolicyQuery {
  status?: PolicyStatusValue;
  type?: string;
  /** Case-insensitive partial match on the holder name. */
  holderName?: string;
  page?: number;
  limit?: number;
}
