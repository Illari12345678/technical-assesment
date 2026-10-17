import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PolicyEntity } from '../models/policy.entity';

/**
 * Port (abstraction): the domain defines WHAT it needs; the infrastructure
 * decides HOW (HTTP today, mock or IndexedDB tomorrow).
 */
export abstract class PolicyRepository {
  abstract findAll(): Observable<PolicyEntity[]>;
  abstract findById(id: string): Observable<PolicyEntity>;
}

export const POLICY_REPOSITORY = new InjectionToken<PolicyRepository>('PolicyRepository');
