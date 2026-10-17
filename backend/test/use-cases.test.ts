import { GetAllPoliciesUseCase } from '../src/application/use-cases/get-all-policies.usecase';
import { GetPolicyByIdUseCase } from '../src/application/use-cases/get-policy-by-id.usecase';
import { PolicyNotFoundError } from '../src/domain/errors/policy-not-found.error';
import { Policy } from '../src/domain/model/policy';
import { PolicyId } from '../src/domain/model/value-objects/policy-id.vo';
import { PolicyType } from '../src/domain/model/value-objects/policy-type.vo';
import { PolicyStatus } from '../src/domain/model/value-objects/policy-status.vo';
import { Premium } from '../src/domain/model/value-objects/premium.vo';
import { PolicyRepositoryPort } from '../src/domain/ports/policy.repository.port';

const buildPolicy = (id: string): Policy =>
  Policy.reconstitute({
    id: PolicyId.from(id),
    policyNumber: 'POL-2026-0001',
    type: PolicyType.from('AUTO'),
    status: PolicyStatus.active(),
    holderName: 'Ana García',
    premium: Premium.create(240.5, 'EUR'),
    startDate: new Date('2026-01-15'),
  });

const buildFakeRepo = (policies: Policy[]): PolicyRepositoryPort => ({
  findAll: jest.fn().mockResolvedValue(policies),
  findById: jest.fn().mockImplementation((id: PolicyId) =>
    Promise.resolve(policies.find((p) => p.id.equals(id)) ?? null),
  ),
});

describe('GetAllPoliciesUseCase', () => {
  it('returns every policy from the repository', async () => {
    const policies = [buildPolicy('id-1'), buildPolicy('id-2')];
    const useCase = new GetAllPoliciesUseCase(buildFakeRepo(policies));

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]?.policyNumber).toBe('POL-2026-0001');
  });
});

describe('GetPolicyByIdUseCase', () => {
  it('returns the policy when it exists', async () => {
    const policy = buildPolicy('exists-1');
    const useCase = new GetPolicyByIdUseCase(buildFakeRepo([policy]));

    const result = await useCase.execute('exists-1');

    expect(result.id.toString()).toBe('exists-1');
    expect(result.isActive()).toBe(true);
  });

  it('throws PolicyNotFoundError when it does not exist', async () => {
    const useCase = new GetPolicyByIdUseCase(buildFakeRepo([]));

    await expect(useCase.execute('missing-id')).rejects.toThrow(PolicyNotFoundError);
  });
});
