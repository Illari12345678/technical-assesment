import { NextFunction, Request, Response } from 'express';
import { CreatePolicyUseCase } from '../../../application/use-cases/create-policy.usecase';
import { GetAllPoliciesUseCase } from '../../../application/use-cases/get-all-policies.usecase';
import { GetPolicyByIdUseCase } from '../../../application/use-cases/get-policy-by-id.usecase';
import { UpdatePolicyUseCase } from '../../../application/use-cases/update-policy.usecase';
import { LoggerPort } from '../../../domain/ports/logger.port';
import { PolicyMapper, PolicyResponseDto } from '../../persistence/mapper/policy.mapper';
import {
  CreatePolicyBodySchema,
  GetPolicyParamsSchema,
  ListPoliciesQuerySchema,
  UpdatePolicyBodySchema,
} from '../schemas/policy-request.schema';

export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedPoliciesDto {
  data: PolicyResponseDto[];
  meta: PaginationMetaDto;
}

/**
 * Primary adapter: translates HTTP ⇄ use cases. Holds no business logic.
 */
export class PolicyController {
  constructor(
    private readonly getAllPolicies: GetAllPoliciesUseCase,
    private readonly getPolicyById: GetPolicyByIdUseCase,
    private readonly createPolicy: CreatePolicyUseCase,
    private readonly updatePolicy: UpdatePolicyUseCase,
    private readonly logger: LoggerPort,
  ) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = ListPoliciesQuerySchema.parse(req.query);
      const { items, total } = await this.getAllPolicies.execute(query);

      const response: PaginatedPoliciesDto = {
        data: items.map(PolicyMapper.toResponseDto),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      };

      this.logger.debug('Fetched policies', { count: response.data.length, total });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = GetPolicyParamsSchema.parse(req.params);
      const policy = await this.getPolicyById.execute(id);
      res.status(200).json(PolicyMapper.toResponseDto(policy));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = CreatePolicyBodySchema.parse(req.body);
      const policy = await this.createPolicy.execute({
        ...body,
        startDate: new Date(body.startDate),
      });
      const dto = PolicyMapper.toResponseDto(policy);

      this.logger.info('Policy created', { id: dto.id });
      res.status(201).location(`/api/policies/${dto.id}`).json(dto);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = GetPolicyParamsSchema.parse(req.params);
      const body = UpdatePolicyBodySchema.parse(req.body);
      const policy = await this.updatePolicy.execute(id, {
        ...body,
        startDate: new Date(body.startDate),
      });

      this.logger.info('Policy updated', { id });
      res.status(200).json(PolicyMapper.toResponseDto(policy));
    } catch (error) {
      next(error);
    }
  };
}
