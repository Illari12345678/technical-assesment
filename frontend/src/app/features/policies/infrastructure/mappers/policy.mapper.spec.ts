import { PolicyMapper } from './policy.mapper';
import { PaginatedPoliciesDto, PolicyResponseDto } from '../dtos/policy-response.dto';

describe('PolicyMapper', () => {
  const dto: PolicyResponseDto = {
    id: '3f1a8c9e-1f0a-4a5e-9c3d-6f2b8d1e4a70',
    policyNumber: 'POL-2026-0001',
    type: 'AUTO',
    status: 'ACTIVE',
    holderName: 'Ana García López',
    premium: { amount: 240.5, currency: 'EUR' },
    startDate: '2026-01-15',
  };

  it('maps a DTO to a domain entity', () => {
    const entity = PolicyMapper.toEntity(dto);

    expect(entity.id).toBe(dto.id);
    expect(entity.policyNumber).toBe('POL-2026-0001');
    expect(entity.type).toBe('AUTO');
    expect(entity.status.isActive()).toBe(true);
    expect(entity.premium.format()).toContain('240,50');
    expect(entity.startDate).toEqual(new Date('2026-01-15'));
  });

  it('maps a list of DTOs', () => {
    const entities = PolicyMapper.toEntities([dto, { ...dto, status: 'EXPIRED' }]);

    expect(entities.length).toBe(2);
    expect(entities[1]?.isActive).toBe(false);
  });

  it('maps a paginated envelope to a domain page', () => {
    const envelope: PaginatedPoliciesDto = {
      data: [dto, { ...dto, id: 'another-id', status: 'PENDING' }],
      meta: { page: 2, limit: 2, total: 6, totalPages: 3 },
    };

    const page = PolicyMapper.toPage(envelope);

    expect(page.items.length).toBe(2);
    expect(page.items[1]?.status.value).toBe('PENDING');
    expect(page.meta).toEqual({ page: 2, limit: 2, total: 6, totalPages: 3 });
  });

  it('throws when the status is invalid', () => {
    expect(() => PolicyMapper.toEntity({ ...dto, status: 'UNKNOWN' })).toThrowError(
      /Invalid policy status/,
    );
  });

  it('throws when the premium currency is invalid', () => {
    expect(() =>
      PolicyMapper.toEntity({ ...dto, premium: { amount: 1, currency: 'JPY' } }),
    ).toThrowError(/Invalid currency/);
  });
});
