import { NextFunction, Request, Response } from 'express';
import { GetAllPoliciesUseCase } from '../../../application/use-cases/get-all-policies.usecase';
import { GetPolicyByIdUseCase } from '../../../application/use-cases/get-policy-by-id.usecase';
import { LoggerPort } from '../../../domain/ports/logger.port';
import { PolicyMapper } from '../../persistence/mapper/policy.mapper';
import { GetPolicyParamsSchema } from '../schemas/policy-request.schema';

/**
 * Primary adapter: translates HTTP ⇄ use cases. Holds no business logic.
 */
export class PolicyController {
  constructor(
    private readonly getAllPolicies: GetAllPoliciesUseCase,
    private readonly getPolicyById: GetPolicyByIdUseCase,
    private readonly logger: LoggerPort,
  ) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const policies = await this.getAllPolicies.execute();
      const response = policies.map(PolicyMapper.toResponseDto);
      this.logger.debug('Fetched all policies', { count: response.length });
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
}
