import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { PolicyListPage } from './policy-list.page';
import { PoliciesStore } from '../../../state/policies.store';
import { PolicyRepository } from '../../../domain/repositories/policy.repository';
import { PolicyEntity } from '../../../domain/models/policy.entity';
import { PolicyPage } from '../../../domain/models/policy-page';
import { PolicyQuery } from '../../../domain/models/policy-query';
import { NewPolicy, PolicyChanges } from '../../../domain/models/policy-input';
import { PolicyStatusVO } from '../../../domain/models/value-objects/policy-status.vo';
import { PremiumVO } from '../../../domain/models/value-objects/premium.vo';
import { GetAllPoliciesUseCase } from '../../../application/get-all-policies.usecase';
import { GetPolicyByIdUseCase } from '../../../application/get-policy-by-id.usecase';
import { CreatePolicyUseCase } from '../../../application/create-policy.usecase';
import { UpdatePolicyUseCase } from '../../../application/update-policy.usecase';
import {
  CREATE_POLICY_USECASE,
  GET_ALL_POLICIES_USECASE,
  GET_POLICY_BY_ID_USECASE,
  UPDATE_POLICY_USECASE,
} from '../../../application/policies.usecases';

const buildPolicy = (id: string, holderName: string): PolicyEntity =>
  new PolicyEntity(
    id,
    `POL-2026-000${id}`,
    'AUTO',
    PolicyStatusVO.from('ACTIVE'),
    holderName,
    PremiumVO.create(240.5, 'EUR'),
    new Date('2026-01-15'),
  );

const buildFakeRepository = (policies: PolicyEntity[]): PolicyRepository => ({
  findAll: (query: PolicyQuery): Observable<PolicyPage> => {
    if (query.holderName === 'boom') {
      return throwError(() => new Error('network'));
    }
    const holderName = query.holderName?.toUpperCase();
    const filtered = policies.filter(
      (policy) =>
        (query.status === undefined || policy.status.value === query.status) &&
        (holderName === undefined || policy.holderName.toUpperCase().includes(holderName)),
    );
    const limit = query.limit ?? 10;
    return of({
      items: filtered.slice(0, limit),
      meta: {
        page: query.page ?? 1,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  },
  findById: (id: string): Observable<PolicyEntity> => {
    const found = policies.find((policy) => policy.id === id);
    return found ? of(found) : throwError(() => new Error('not found'));
  },
  create: (policy: NewPolicy): Observable<PolicyEntity> =>
    of(buildPolicy('created', policy.holderName)),
  update: (id: string, changes: PolicyChanges): Observable<PolicyEntity> =>
    of(buildPolicy(id, changes.holderName)),
});

describe('PolicyListPage', () => {
  let fixture: ComponentFixture<PolicyListPage>;
  let page: PolicyListPage;
  let repo: PolicyRepository;

  beforeEach(async () => {
    repo = buildFakeRepository([buildPolicy('1', 'Ana García'), buildPolicy('2', 'Carlos Ruiz')]);

    await TestBed.configureTestingModule({
      imports: [PolicyListPage],
      providers: [
        provideRouter([]),
        { provide: GET_ALL_POLICIES_USECASE, useFactory: () => new GetAllPoliciesUseCase(repo) },
        { provide: GET_POLICY_BY_ID_USECASE, useFactory: () => new GetPolicyByIdUseCase(repo) },
        { provide: CREATE_POLICY_USECASE, useFactory: () => new CreatePolicyUseCase(repo) },
        { provide: UPDATE_POLICY_USECASE, useFactory: () => new UpdatePolicyUseCase(repo) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyListPage);
    page = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders one card per policy', () => {
    const cards = fixture.nativeElement.querySelectorAll('app-policy-card');
    expect(cards.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Ana García');
  });

  it('debounces holder searches and forwards the term to the repository', fakeAsync(() => {
    const findAllSpy = spyOn(repo, 'findAll').and.callThrough();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="search"]');
    input.value = 'ruiz';
    input.dispatchEvent(new Event('input'));

    tick(299);
    expect(findAllSpy).not.toHaveBeenCalled();

    tick(1);
    flush();

    expect(findAllSpy).toHaveBeenCalledTimes(1);
    expect(findAllSpy.calls.mostRecent().args[0]).toEqual(
      jasmine.objectContaining({ page: 1, holderName: 'ruiz' }),
    );
  }));

  it('filters by status through the store', () => {
    const findAllSpy = spyOn(repo, 'findAll').and.callThrough();

    page.onStatusChange('ACTIVE');

    expect(page.store.statusFilter()).toBe('ACTIVE');
    expect(findAllSpy.calls.mostRecent().args[0]).toEqual(
      jasmine.objectContaining({ status: 'ACTIVE', page: 1 }),
    );
  });

  it('navigates to the create form', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    fixture.nativeElement.querySelector('button.page__new').click();

    expect(navigateSpy).toHaveBeenCalledWith(['/policies', 'new']);
  });

  it('navigates to the detail page when a card is selected', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    page.openPolicy(buildPolicy('42', 'Ana García'));

    expect(navigateSpy).toHaveBeenCalledWith(['/policies', '42']);
  });

  it('shows an error message when loading fails', () => {
    (page.store as PoliciesStore).loadPolicies({ holderName: 'boom' });
    fixture.detectChanges();

    expect(page.store.error()).toBe('No se pudieron cargar las pólizas');
    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar las pólizas');
  });
});
