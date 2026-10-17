import { CreatePolicyUseCase } from '../src/application/use-cases/create-policy.usecase';
import { GetAllPoliciesUseCase } from '../src/application/use-cases/get-all-policies.usecase';
import { GetPolicyByIdUseCase } from '../src/application/use-cases/get-policy-by-id.usecase';
import { UpdatePolicyUseCase } from '../src/application/use-cases/update-policy.usecase';
import { InvalidStatusTransitionError } from '../src/domain/errors/invalid-status-transition.error';
import { PolicyAlreadyExistsError } from '../src/domain/errors/policy-already-exists.error';
import { PolicyNotFoundError } from '../src/domain/errors/policy-not-found.error';
import { Policy } from '../src/domain/model/policy';
import { PolicyId } from '../src/domain/model/value-objects/policy-id.vo';
import { PolicyStatus } from '../src/domain/model/value-objects/policy-status.vo';
import { PolicyType } from '../src/domain/model/value-objects/policy-type.vo';
import { Premium } from '../src/domain/model/value-objects/premium.vo';
import { PolicyQuery, PolicyRepositoryPort } from '../src/domain/ports/policy.repository.port';

const buildPolicy = (id: string, overrides: Partial<{ status: string; policyNumber: string }> = {}): Policy =>
  Policy.reconstitute({
    id: PolicyId.from(id),
    policyNumber: overrides.policyNumber ?? 'POL-2026-0001',
    type: PolicyType.from('AUTO'),
    status: PolicyStatus.from(overrides.status ?? 'ACTIVE'),
    holderName: 'Ana García',
    premium: Premium.create(240.5, 'EUR'),
    startDate: new Date('2026-01-15'),
  });

/** Fake adapter that mimics the paginated repository port, backed by an array. */
const buildFakeRepo = (
  initial: Policy[] = [],
): PolicyRepositoryPort & { store: Policy[] } => {
  const store = [...initial];
  return {
    store,
    findAll: jest.fn(async (query: PolicyQuery) => {
      const holderName = query.holderName?.toUpperCase();
      const filtered = store.filter(
        (policy) =>
          (query.status === undefined || policy.status.toString() === query.status) &&
          (query.type === undefined || policy.type.toString() === query.type) &&
          (holderName === undefined || policy.holderName.toUpperCase().includes(holderName)),
      );
      const start = (query.page - 1) * query.limit;
      return { items: filtered.slice(start, start + query.limit), total: filtered.length };
    }),
    findById: jest.fn(async (id: PolicyId) => store.find((p) => p.id.equals(id)) ?? null),
    findByNumber: jest.fn(
      async (policyNumber: string) => store.find((p) => p.policyNumber === policyNumber) ?? null,
    ),
    save: jest.fn(async (policy: Policy) => {
      store.push(policy);
    }),
    update: jest.fn(async (policy: Policy) => {
      const index = store.findIndex((p) => p.id.equals(policy.id));
      if (index !== -1) {
        store[index] = policy;
      }
    }),
  };
};

describe('GetAllPoliciesUseCase', () => {
  it('applies default pagination when no input is given', async () => {
    const repo = buildFakeRepo([buildPolicy('id-1'), buildPolicy('id-2')]);
    const useCase = new GetAllPoliciesUseCase(repo);

    const result = await useCase.execute();

    expect(repo.findAll).toHaveBeenCalledWith({
      status: undefined,
      type: undefined,
      holderName: undefined,
      page: 1,
      limit: 10,
    });
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('forwards filters and pagination to the repository', async () => {
    const policies = [
      buildPolicy('id-1', { status: 'ACTIVE' }),
      buildPolicy('id-2', { status: 'PENDING' }),
      buildPolicy('id-3', { status: 'ACTIVE' }),
    ];
    const useCase = new GetAllPoliciesUseCase(buildFakeRepo(policies));

    const result = await useCase.execute({ status: 'ACTIVE', page: 1, limit: 1 });

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(1);
  });

  it('forwards the holder name search and filters case-insensitively', async () => {
    const useCase = new GetAllPoliciesUseCase(buildFakeRepo([buildPolicy('id-1')]));

    const result = await useCase.execute({ holderName: 'garcía' });

    expect(result.total).toBe(1);
    expect(result.items[0]?.holderName).toBe('Ana García');
  });
});

describe('GetPolicyByIdUseCase', () => {
  it('returns the policy when it exists', async () => {
    const useCase = new GetPolicyByIdUseCase(buildFakeRepo([buildPolicy('exists-1')]));

    const result = await useCase.execute('exists-1');

    expect(result.id.toString()).toBe('exists-1');
    expect(result.isActive()).toBe(true);
  });

  it('throws PolicyNotFoundError when it does not exist', async () => {
    const useCase = new GetPolicyByIdUseCase(buildFakeRepo([]));

    await expect(useCase.execute('missing-id')).rejects.toThrow(PolicyNotFoundError);
  });
});

describe('CreatePolicyUseCase', () => {
  const input = {
    policyNumber: 'POL-2026-9001',
    type: 'auto',
    holderName: 'Ana García',
    premium: { amount: 240.5, currency: 'EUR' },
    startDate: new Date('2026-01-15'),
  };

  it('creates, persists and returns the policy with a PENDING default status', async () => {
    const repo = buildFakeRepo();
    const useCase = new CreatePolicyUseCase(repo);

    const policy = await useCase.execute(input);

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.store).toHaveLength(1);
    expect(policy.status.toString()).toBe('PENDING');
    expect(policy.type.toString()).toBe('AUTO');
  });

  it('throws PolicyAlreadyExistsError when the policy number is taken', async () => {
    const repo = buildFakeRepo([buildPolicy('id-1', { policyNumber: 'POL-2026-9001' })]);
    const useCase = new CreatePolicyUseCase(repo);

    await expect(useCase.execute(input)).rejects.toThrow(PolicyAlreadyExistsError);
    expect(repo.save).not.toHaveBeenCalled();
  });
});

describe('UpdatePolicyUseCase', () => {
  const input = {
    type: 'HOME',
    holderName: 'Carlos Ruiz',
    premium: { amount: 100, currency: 'USD' },
    startDate: new Date('2027-05-05'),
  };

  it('updates an existing policy and persists it', async () => {
    const repo = buildFakeRepo([buildPolicy('id-1', { status: 'PENDING' })]);
    const useCase = new UpdatePolicyUseCase(repo);

    const policy = await useCase.execute('id-1', { ...input, status: 'ACTIVE' });

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(policy.holderName).toBe('Carlos Ruiz');
    expect(policy.status.toString()).toBe('ACTIVE');
  });

  it('throws PolicyNotFoundError when the policy does not exist', async () => {
    const useCase = new UpdatePolicyUseCase(buildFakeRepo([]));

    await expect(useCase.execute('missing-id', input)).rejects.toThrow(PolicyNotFoundError);
  });

  it('throws InvalidStatusTransitionError on an illegal transition', async () => {
    const repo = buildFakeRepo([buildPolicy('id-1', { status: 'CANCELLED' })]);
    const useCase = new UpdatePolicyUseCase(repo);

    await expect(useCase.execute('id-1', { ...input, status: 'ACTIVE' })).rejects.toThrow(
      InvalidStatusTransitionError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });
});
