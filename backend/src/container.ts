import { Router } from 'express';
import { EnvConfig } from './config/env.config';
import { GetAllPoliciesUseCase } from './application/use-cases/get-all-policies.usecase';
import { GetPolicyByIdUseCase } from './application/use-cases/get-policy-by-id.usecase';
import { LoggerPort } from './domain/ports/logger.port';
import { PolicyController } from './infrastructure/http/controllers/policy.controller';
import { createPolicyRoutes } from './infrastructure/http/routes/policy.routes';
import { ConsoleLoggerAdapter } from './infrastructure/logging/console-logger.adapter';
import { InMemoryPolicyRepository } from './infrastructure/persistence/in-memory/in-memory-policy.repository';

export interface AppContainer {
  env: EnvConfig;
  logger: LoggerPort;
  policyRoutes: Router;
}

/**
 * Composition Root: the ONLY place in the app where concrete adapters
 * are instantiated and wired to the abstractions (ports).
 */
export const createContainer = (env: EnvConfig): AppContainer => {
  const logger = new ConsoleLoggerAdapter();

  // Secondary adapters (output ports)
  const policyRepository = new InMemoryPolicyRepository();

  // Use cases
  const getAllPolicies = new GetAllPoliciesUseCase(policyRepository);
  const getPolicyById = new GetPolicyByIdUseCase(policyRepository);

  // Primary adapters (input ports)
  const policyController = new PolicyController(getAllPolicies, getPolicyById, logger);
  const policyRoutes = createPolicyRoutes(policyController);

  return { env, logger, policyRoutes };
};
