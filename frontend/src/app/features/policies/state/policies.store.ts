import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { ApiError } from '../../../core/http/api-error';
import { PolicyEntity } from '../domain/models/policy.entity';
import { PageMeta, PolicyPage } from '../domain/models/policy-page';
import { PolicyQuery } from '../domain/models/policy-query';
import { NewPolicy, PolicyChanges } from '../domain/models/policy-input';
import { PolicyStatusValue } from '../domain/models/value-objects/policy-status.vo';
import { GetAllPoliciesUseCase } from '../application/get-all-policies.usecase';
import { GetPolicyByIdUseCase } from '../application/get-policy-by-id.usecase';
import { CreatePolicyUseCase } from '../application/create-policy.usecase';
import { UpdatePolicyUseCase } from '../application/update-policy.usecase';
import {
  CREATE_POLICY_USECASE,
  GET_ALL_POLICIES_USECASE,
  GET_POLICY_BY_ID_USECASE,
  UPDATE_POLICY_USECASE,
} from '../application/policies.usecases';

const DEFAULT_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;

const emptyPage = (page: number, limit: number): PolicyPage => ({
  items: [],
  meta: { page, limit, total: 0, totalPages: 0 },
});

/**
 * Signals-based store: state + loading actions.
 * Presentation only interacts with this store and domain entities.
 */
@Injectable({ providedIn: 'root' })
export class PoliciesStore {
  private readonly getAllPolicies = inject<GetAllPoliciesUseCase>(GET_ALL_POLICIES_USECASE);
  private readonly getPolicyById = inject<GetPolicyByIdUseCase>(GET_POLICY_BY_ID_USECASE);
  private readonly createPolicyUseCase = inject<CreatePolicyUseCase>(CREATE_POLICY_USECASE);
  private readonly updatePolicyUseCase = inject<UpdatePolicyUseCase>(UPDATE_POLICY_USECASE);

  readonly policies = signal<PolicyEntity[]>([]);
  readonly selectedPolicy = signal<PolicyEntity | null>(null);
  readonly meta = signal<PageMeta>({ page: 1, limit: DEFAULT_LIMIT, total: 0, totalPages: 0 });
  readonly statusFilter = signal<PolicyStatusValue | null>(null);
  readonly searchTerm = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly hasPreviousPage = computed(() => this.meta().page > 1);
  readonly hasNextPage = computed(() => this.meta().page < this.meta().totalPages);

  /** Loads a page; unspecified criteria fall back to the current filter/page. */
  loadPolicies(query: PolicyQuery = {}): void {
    const current = this.meta();

    this.loading.set(true);
    this.error.set(null);

    this.fetch({
      ...query,
      page: query.page ?? current.page,
      limit: query.limit ?? current.limit,
    }).subscribe((result) => {
      this.applyPage(result);
      this.loading.set(false);
    });
  }

  /**
   * Holder search: debounces keystrokes, ignores repeats and cancels the
   * in-flight request with `switchMap` when a new term arrives.
   * The caller owns the subscription lifetime (e.g. `takeUntilDestroyed`).
   */
  search(term$: Observable<string>): void {
    term$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        switchMap((term) => {
          this.loading.set(true);
          this.error.set(null);
          this.searchTerm.set(term);
          return this.fetch({ page: 1, holderName: term.trim() || undefined });
        }),
      )
      .subscribe((result) => {
        this.applyPage(result);
        this.loading.set(false);
      });
  }

  setStatusFilter(status: PolicyStatusValue | null): void {
    this.statusFilter.set(status);
    this.loadPolicies({ page: 1 });
  }

  goToPage(page: number): void {
    if (page < 1) {
      return;
    }
    this.loadPolicies({ page });
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.goToPage(this.meta().page + 1);
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.goToPage(this.meta().page - 1);
    }
  }

  loadPolicy(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.selectedPolicy.set(null);
    this.getPolicyById
      .execute(id)
      .pipe(
        tap((policy) => this.selectedPolicy.set(policy)),
        catchError((error: unknown) => {
          this.error.set(this.messageOf(error, 'No se pudo cargar la póliza'));
          return of<PolicyEntity | null>(null);
        }),
      )
      .subscribe(() => this.loading.set(false));
  }

  createPolicy(policy: NewPolicy): Observable<PolicyEntity> {
    this.loading.set(true);
    this.error.set(null);
    return this.createPolicyUseCase.execute(policy).pipe(
      tap(() => this.loadPolicies({ page: 1 })),
      catchError((error: unknown) => {
        this.loading.set(false);
        this.error.set(this.messageOf(error, 'No se pudo crear la póliza'));
        return throwError(() => error);
      }),
    );
  }

  updatePolicy(id: string, changes: PolicyChanges): Observable<PolicyEntity> {
    this.loading.set(true);
    this.error.set(null);
    return this.updatePolicyUseCase.execute(id, changes).pipe(
      tap((updated) => {
        this.policies.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
        if (this.selectedPolicy()?.id === updated.id) {
          this.selectedPolicy.set(updated);
        }
        this.loading.set(false);
      }),
      catchError((error: unknown) => {
        this.loading.set(false);
        this.error.set(this.messageOf(error, 'No se pudo actualizar la póliza'));
        return throwError(() => error);
      }),
    );
  }

  private fetch(query: PolicyQuery): Observable<PolicyPage> {
    const page = query.page ?? 1;
    const limit = query.limit ?? this.meta().limit;

    return this.getAllPolicies
      .execute({
        page,
        limit,
        status: query.status ?? this.statusFilter() ?? undefined,
        type: query.type,
        holderName: query.holderName,
      })
      .pipe(
        catchError((error: unknown) => {
          this.error.set(this.messageOf(error, 'No se pudieron cargar las pólizas'));
          return of(emptyPage(page, limit));
        }),
      );
  }

  private applyPage(page: PolicyPage): void {
    this.policies.set(page.items);
    this.meta.set(page.meta);
  }

  /** Prefers the normalised API message; falls back to a friendly one. */
  private messageOf(error: unknown, fallback: string): string {
    const apiError = error as Partial<ApiError> | null;
    return apiError && typeof apiError.code === 'string' && typeof apiError.message === 'string'
      ? apiError.message
      : fallback;
  }
}
