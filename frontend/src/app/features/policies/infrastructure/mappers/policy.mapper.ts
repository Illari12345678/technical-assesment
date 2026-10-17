import { PolicyEntity } from '../../domain/models/policy.entity';
import { PolicyStatusVO } from '../../domain/models/value-objects/policy-status.vo';
import { PremiumVO } from '../../domain/models/value-objects/premium.vo';
import { PolicyResponseDto } from '../dtos/policy-response.dto';

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
}
