import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PolicyEntity } from '../models/policy.entity';

/**
 * Puerto (abstracción): el dominio define QUÉ necesita; la infraestructura
 * decide CÓMO (HTTP hoy, mock o IndexedDB mañana).
 */
export abstract class PolicyRepository {
  abstract findAll(): Observable<PolicyEntity[]>;
  abstract findById(id: string): Observable<PolicyEntity>;
}

export const POLICY_REPOSITORY = new InjectionToken<PolicyRepository>('PolicyRepository');
