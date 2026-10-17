import { InvalidPolicyDataError } from '../src/domain/errors/invalid-policy-data.error';
import { InvalidStatusTransitionError } from '../src/domain/errors/invalid-status-transition.error';
import { CreatePolicyProps, Policy } from '../src/domain/model/policy';
import { PolicyStatus } from '../src/domain/model/value-objects/policy-status.vo';

const validProps: CreatePolicyProps = {
  policyNumber: 'POL-2026-9001',
  type: 'AUTO',
  holderName: 'Ana García',
  premium: { amount: 240.5, currency: 'EUR' },
  startDate: new Date('2026-01-15'),
};

describe('Policy.create', () => {
  it('creates a policy with a generated id and PENDING status by default', () => {
    const policy = Policy.create(validProps);

    expect(policy.id.toString()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(policy.status.toString()).toBe('PENDING');
    expect(policy.policyNumber).toBe('POL-2026-9001');
  });

  it('honours an explicit status and normalises enum casing', () => {
    const policy = Policy.create({ ...validProps, type: 'auto', status: 'active' });

    expect(policy.type.toString()).toBe('AUTO');
    expect(policy.status.toString()).toBe('ACTIVE');
  });

  it.each([
    ['empty policyNumber', { ...validProps, policyNumber: '   ' }],
    ['empty holderName', { ...validProps, holderName: '' }],
    ['unknown type', { ...validProps, type: 'SPACESHIP' }],
    ['unknown status', { ...validProps, status: 'WEIRD' }],
    ['non-positive premium', { ...validProps, premium: { amount: 0, currency: 'EUR' } }],
    ['unsupported currency', { ...validProps, premium: { amount: 10, currency: 'BTC' } }],
    ['invalid startDate', { ...validProps, startDate: new Date('nope') }],
  ])('rejects %s with a 422 domain error', (_label, props) => {
    expect(() => Policy.create(props as CreatePolicyProps)).toThrow(InvalidPolicyDataError);
  });
});

describe('Policy.changeStatus', () => {
  const createWithStatus = (status: string): Policy =>
    Policy.create({ ...validProps, status });

  it.each([
    ['PENDING', 'ACTIVE'],
    ['PENDING', 'CANCELLED'],
    ['ACTIVE', 'CANCELLED'],
    ['ACTIVE', 'EXPIRED'],
  ])('allows %s → %s', (from, to) => {
    const policy = createWithStatus(from);

    policy.changeStatus(PolicyStatus.from(to));

    expect(policy.status.toString()).toBe(to);
  });

  it('treats the same status as a no-op', () => {
    const policy = createWithStatus('ACTIVE');

    policy.changeStatus(PolicyStatus.active());

    expect(policy.status.toString()).toBe('ACTIVE');
  });

  it.each([
    ['CANCELLED', 'ACTIVE'],
    ['EXPIRED', 'ACTIVE'],
    ['ACTIVE', 'PENDING'],
  ])('rejects terminal or backwards transition %s → %s with 422', (from, to) => {
    const policy = createWithStatus(from);

    expect(() => policy.changeStatus(PolicyStatus.from(to))).toThrow(InvalidStatusTransitionError);
    expect(policy.status.toString()).toBe(from);
  });
});

describe('Policy.updateDetails', () => {
  it('updates the mutable fields', () => {
    const policy = Policy.create(validProps);

    policy.updateDetails({
      holderName: 'Carlos Ruiz',
      premium: { amount: 100, currency: 'USD' },
      startDate: new Date('2027-05-05'),
      status: 'ACTIVE',
    });

    expect(policy.holderName).toBe('Carlos Ruiz');
    expect(policy.premium.toJSON()).toEqual({ amount: 100, currency: 'USD' });
    expect(policy.startDate).toEqual(new Date('2027-05-05'));
    expect(policy.status.toString()).toBe('ACTIVE');
  });

  it('rejects invalid data with a 422 domain error', () => {
    const policy = Policy.create(validProps);

    expect(() => policy.updateDetails({ holderName: '   ' })).toThrow(InvalidPolicyDataError);
  });
});
