import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { PolicyEntity } from '../domain/models/policy.entity';
import { PolicyPage } from '../domain/models/policy-page';
import { PolicyQuery } from '../domain/models/policy-query';
import { NewPolicy, PolicyChanges } from '../domain/models/policy-input';
import { PolicyStatusVO } from '../domain/models/value-objects/policy-status.vo';
import { PremiumVO } from '../domain/models/value-objects/premium.vo';
import { PolicyRepository } from '../domain/repositories/policy.repository';
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
import { PoliciesStore } from './policies.store';

const buildPolicy = (id: string, holderName = 'Ana García'): PolicyEntity =>
  new PolicyEntity(
    id,
    'POL-2026-0001',
    'AUTO',
    PolicyStatusVO.from('ACTIVE'),
    holderName,
    PremiumVO.create(240.5, 'EUR'),
    new Date('2026-01-15'),
  );

const buildFakeRepository = (policies: PolicyEntity[], shouldFail = false): PolicyRepository => ({
  findAll: (query: PolicyQuery): Observable<PolicyPage> => {
    if (shouldFail) {
      return throwError(() => new Error('network'));
    }
    const holderName = query.holderName?.toUpperCase();
    const filtered = policies.filter(
      (policy) =>
        (query.status === undefined || policy.status.value === query.status) &&
        (holderName === undefined || policy.holderName.toUpperCase().includes(holderName)),
    );
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const start = (page - 1) * limit;
    return of({
      items: filtered.slice(start, start + limit),
      meta: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  },
  findById: (id: string): Observable<PolicyEntity> => {
    const found = policies.find((policy) => policy.id === id);
    return shouldFail || !found ? throwError(() => new Error('not found')) : of(found);
  },
  create: (policy: NewPolicy): Observable<PolicyEntity> =>
    shouldFail
      ? throwError(() => new Error('network'))
      : of(
          new PolicyEntity(
            'created-id',
            policy.policyNumber,
            policy.type,
            PolicyStatusVO.from(policy.status ?? 'PENDING'),
            policy.holderName,
            PremiumVO.create(policy.premium.amount, policy.premium.currency),
            new Date(policy.startDate),
          ),
        ),
  update: (id: string, changes: PolicyChanges): Observable<PolicyEntity> =>
    shouldFail
      ? throwError(() => new Error('network'))
      : of(
          new PolicyEntity(
            id,
            'POL-2026-0001',
            changes.type,
            PolicyStatusVO.from(changes.status ?? 'ACTIVE'),
            changes.holderName,
            PremiumVO.create(changes.premium.amount, changes.premium.currency),
            new Date(changes.startDate),
          ),
        ),
});

const changes: PolicyChanges = {
  type: 'HOME',
  holderName: 'Carlos Ruiz',
  premium: { amount: 100, currency: 'USD' },
  startDate: '2027-05-05',
  status: 'ACTIVE',
};

describe('PoliciesStore', () => {
  const setup = (repo: PolicyRepository): PoliciesStore => {
    TestBed.configureTestingModule({
      providers: [
        { provide: GET_ALL_POLICIES_USECASE, useFactory: () => new GetAllPoliciesUseCase(repo) },
        { provide: GET_POLICY_BY_ID_USECASE, useFactory: () => new GetPolicyByIdUseCase(repo) },
        { provide: CREATE_POLICY_USECASE, useFactory: () => new CreatePolicyUseCase(repo) },
        { provide: UPDATE_POLICY_USECASE, useFactory: () => new UpdatePolicyUseCase(repo) },
        PoliciesStore,
      ],
    });
    return TestBed.inject(PoliciesStore);
  };

  it('loads policies into the signal state', () => {
    const store = setup(buildFakeRepository([buildPolicy('a'), buildPolicy('b')]));

    store.loadPolicies();

    expect(store.loading()).toBe(false);
    expect(store.policies().length).toBe(2);
    expect(store.error()).toBeNull();
  });

  it('sets an error signal when loading fails', () => {
    const store = setup(buildFakeRepository([], true));

    store.loadPolicies();

    expect(store.loading()).toBe(false);
    expect(store.policies().length).toBe(0);
    expect(store.error()).toBe('No se pudieron cargar las pólizas');
  });

  it('filters by status and resets to the first page', () => {
    const store = setup(
      buildFakeRepository([
        buildPolicy('a'),
        new PolicyEntity(
          'b',
          'POL-2026-0002',
          'HOME',
          PolicyStatusVO.from('PENDING'),
          'Carlos Ruiz',
          PremiumVO.create(100, 'EUR'),
          new Date('2026-02-01'),
        ),
      ]),
    );

    store.setStatusFilter('PENDING');

    expect(store.statusFilter()).toBe('PENDING');
    expect(store.policies().length).toBe(1);
    expect(store.policies()[0]?.id).toBe('b');
    expect(store.meta().page).toBe(1);
  });

  it('paginates through the meta information', () => {
    const policies = Array.from({ length: 5 }, (_, index) => buildPolicy(`p-${index}`));
    const store = setup(buildFakeRepository(policies));

    store.loadPolicies({ limit: 2 });
    expect(store.policies().length).toBe(2);
    expect(store.hasNextPage()).toBe(true);

    store.nextPage();

    expect(store.meta().page).toBe(2);
    expect(store.policies()[0]?.id).toBe('p-2');
    expect(store.hasPreviousPage()).toBe(true);
  });

  it('debounces, ignores repeated terms and cancels in-flight searches', fakeAsync(() => {
    const repo = buildFakeRepository([
      buildPolicy('a', 'Ana García'),
      buildPolicy('b', 'Carlos Ruiz'),
    ]);
    const findAllSpy = spyOn(repo, 'findAll').and.callThrough();
    const store = setup(repo);
    const terms$ = new Subject<string>();

    store.search(terms$);
    terms$.next('ana');
    terms$.next('ana'); // repeated: distinctUntilChanged drops it
    terms$.next('ana g');

    tick(299);
    expect(findAllSpy).not.toHaveBeenCalled();

    tick(1);
    flush();

    expect(store.searchTerm()).toBe('ana g');
    expect(store.meta().page).toBe(1);
  }));

  it('searches by holder name against the repository', fakeAsync(() => {
    const store = setup(
      buildFakeRepository([buildPolicy('a', 'Ana García'), buildPolicy('b', 'Carlos Ruiz')]),
    );
    const terms$ = new Subject<string>();

    store.search(terms$);
    terms$.next('Ruiz');
    tick(300);
    flush();

    expect(store.policies().length).toBe(1);
    expect(store.policies()[0]?.holderName).toBe('Carlos Ruiz');
  }));

  it('loads a single policy by id', () => {
    const store = setup(buildFakeRepository([buildPolicy('a-1')]));

    store.loadPolicy('a-1');

    expect(store.selectedPolicy()?.id).toBe('a-1');
    expect(store.loading()).toBe(false);
  });

  it('reloads the first page after creating a policy', () => {
    const repo = buildFakeRepository([buildPolicy('a')]);
    const findAllSpy = spyOn(repo, 'findAll').and.callThrough();
    const store = setup(repo);

    store
      .createPolicy({
        policyNumber: 'POL-2026-9001',
        type: 'AUTO',
        holderName: 'Ana García',
        premium: { amount: 240.5, currency: 'EUR' },
        startDate: '2026-01-15',
      })
      .subscribe();

    expect(findAllSpy).toHaveBeenCalledTimes(1);
    expect(store.loading()).toBe(false);
  });

  it('sets an error signal when creating fails', () => {
    const store = setup(buildFakeRepository([], true));

    store
      .createPolicy({
        policyNumber: 'POL-2026-9001',
        type: 'AUTO',
        holderName: 'Ana García',
        premium: { amount: 240.5, currency: 'EUR' },
        startDate: '2026-01-15',
      })
      .subscribe({ error: () => undefined });

    expect(store.error()).toBe('No se pudo crear la póliza');
  });

  it('patches the list in place after updating a policy', () => {
    const store = setup(buildFakeRepository([buildPolicy('a')]));
    store.loadPolicies();

    store.updatePolicy('a', changes).subscribe();

    expect(store.policies()[0]?.holderName).toBe('Carlos Ruiz');
    expect(store.loading()).toBe(false);
  });

  it('sets an error signal when updating fails', () => {
    const store = setup(buildFakeRepository([], true));

    store.updatePolicy('a', changes).subscribe({ error: () => undefined });

    expect(store.error()).toBe('No se pudo actualizar la póliza');
  });
});
