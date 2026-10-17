import { Policy } from '../model/policy';
import { PolicyId } from '../model/value-objects/policy-id.vo';

/**
 * Secondary output port: the domain defines WHAT needs persisting;
 * the infrastructure decides HOW.
 */
export interface PolicyRepositoryPort {
  findAll(): Promise<Policy[]>;
  findById(id: PolicyId): Promise<Policy | null>;
}
