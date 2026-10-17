import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PolicyEntity } from '../models/policy.entity';
import { PolicyPage } from '../models/policy-page';
import { PolicyQuery } from '../models/policy-query';
import { NewPolicy, PolicyChanges } from '../models/policy-input';

/**
 * Port (abstraction): the domain defines WHAT it needs; the infrastructure
 * decides HOW (HTTP today, mock or IndexedDB tomorrow).
 */
export abstract class PolicyRepository {
  abstract findAll(query: PolicyQuery): Observable<PolicyPage>;
  abstract findById(id: string): Observable<PolicyEntity>;
  abstract create(policy: NewPolicy): Observable<PolicyEntity>;
  abstract update(id: string, changes: PolicyChanges): Observable<PolicyEntity>;
}

export const POLICY_REPOSITORY = new InjectionToken<PolicyRepository>('PolicyRepository');
