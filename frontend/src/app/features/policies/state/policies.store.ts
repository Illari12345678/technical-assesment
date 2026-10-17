import { Injectable, inject, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { PolicyEntity } from '../domain/models/policy.entity';
import { GetAllPoliciesUseCase } from '../application/get-all-policies.usecase';
import { GetPolicyByIdUseCase } from '../application/get-policy-by-id.usecase';
import {
  GET_ALL_POLICIES_USECASE,
  GET_POLICY_BY_ID_USECASE,
} from '../application/policies.usecases';

/**
 * Store basado en Signals: estado + acciones de carga.
 * La presentación solo interactúa con este store y las entidades de dominio.
 */
@Injectable({ providedIn: 'root' })
export class PoliciesStore {
  private readonly getAllPolicies = inject<GetAllPoliciesUseCase>(GET_ALL_POLICIES_USECASE);
  private readonly getPolicyById = inject<GetPolicyByIdUseCase>(GET_POLICY_BY_ID_USECASE);

  readonly policies = signal<PolicyEntity[]>([]);
  readonly selectedPolicy = signal<PolicyEntity | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadPolicies(): void {
    this.loading.set(true);
    this.error.set(null);
    this.getAllPolicies
      .execute()
      .pipe(
        catchError(() => {
          this.error.set('No se pudieron cargar las pólizas');
          return of<PolicyEntity[]>([]);
        }),
      )
      .subscribe((policies) => {
        this.policies.set(policies);
        this.loading.set(false);
      });
  }

  loadPolicy(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.selectedPolicy.set(null);
    this.getPolicyById
      .execute(id)
      .pipe(
        tap((policy) => this.selectedPolicy.set(policy)),
        catchError(() => {
          this.error.set('No se pudo cargar la póliza');
          return of<PolicyEntity | null>(null);
        }),
      )
      .subscribe(() => this.loading.set(false));
  }
}
