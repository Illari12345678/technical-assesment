import { PolicyEntity } from './policy.entity';

/** Pagination metadata of a policy list response. */
export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** A page of domain entities plus its metadata — what the UI consumes. */
export interface PolicyPage {
  items: PolicyEntity[];
  meta: PageMeta;
}
