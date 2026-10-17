import { PolicyEntity } from '../../domain/models/policy.entity';
import { PolicyPage } from '../../domain/models/policy-page';
import { PolicyStatusVO } from '../../domain/models/value-objects/policy-status.vo';
import { PremiumVO } from '../../domain/models/value-objects/premium.vo';
import { PaginatedPoliciesDto, PolicyResponseDto } from '../dtos/policy-response.dto';

/**
 * Single translation point between DTO ⇄ domain entity.
 */
export class PolicyMapper {
  static toEntity(dto: PolicyResponseDto): PolicyEntity {
    return new PolicyEntity(
      dto.id,
      dto.policyNumber,
      dto.type.trim().toUpperCase(),
      PolicyStatusVO.from(dto.status),
      dto.holderName,
      PremiumVO.create(dto.premium.amount, dto.premium.currency),
      new Date(dto.startDate),
    );
  }

  static toEntities(dtos: PolicyResponseDto[]): PolicyEntity[] {
    return dtos.map((dto) => PolicyMapper.toEntity(dto));
  }

  /** Envelope DTO → domain page (entities + metadata). */
  static toPage(dto: PaginatedPoliciesDto): PolicyPage {
    return {
      items: PolicyMapper.toEntities(dto.data),
      meta: {
        page: dto.meta.page,
        limit: dto.meta.limit,
        total: dto.meta.total,
        totalPages: dto.meta.totalPages,
      },
    };
  }
}
