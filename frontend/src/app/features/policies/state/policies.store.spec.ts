import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { PolicyEntity } from '../domain/models/policy.entity';
import { PolicyStatusVO } from '../domain/models/value-objects/policy-status.vo';
import { PremiumVO } from '../domain/models/value-objects/premium.vo';
import { PolicyRepository } from '../domain/repositories/policy.repository';
import { GetAllPoliciesUseCase } from '../application/get-all-policies.usecase';
import { GetPolicyByIdUseCase } from '../application/get-policy-by-id.usecase';
import {
  GET_ALL_POLICIES_USECASE,
  GET_POLICY_BY_ID_USECASE,
} from '../application/policies.usecases';
import { PoliciesStore } from './policies.store';

const buildPolicy = (id: string): PolicyEntity =>
  new PolicyEntity(
    id,
    'POL-2026-0001',
    'AUTO',
    PolicyStatusVO.from('ACTIVE'),
    'Ana García',
    PremiumVO.create(240.5, 'EUR'),
    new Date('2026-01-15'),
  );

const buildFakeRepository = (policies: PolicyEntity[], shouldFail = false): PolicyRepository => ({
  findAll: (): Observable<PolicyEntity[]> =>
    shouldFail ? throwError(() => new Error('network')) : of(policies),
  findById: (id: string): Observable<PolicyEntity> => {
    const found = policies.find((p) => p.id === id);
    return shouldFail || !found ? throwError(() => new Error('not found')) : of(found);
  },
});

describe('PoliciesStore', () => {
  const setup = (repo: PolicyRepository): PoliciesStore => {
    TestBed.configureTestingModule({
      providers: [
        { provide: GET_ALL_POLICIES_USECASE, useFactory: () => new GetAllPoliciesUseCase(repo) },
        { provide: GET_POLICY_BY_ID_USECASE, useFactory: () => new GetPolicyByIdUseCase(repo) },
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

  it('loads a single policy by id', () => {
    const store = setup(buildFakeRepository([buildPolicy('a-1')]));

    store.loadPolicy('a-1');

    expect(store.selectedPolicy()?.id).toBe('a-1');
    expect(store.loading()).toBe(false);
  });
});
