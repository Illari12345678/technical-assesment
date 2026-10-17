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
 * Composition Root: ÚNICO punto de la aplicación donde se instancian
 * concretos (adaptadores) y se ensamblan con las abstracciones (puertos).
 */
export const createContainer = (env: EnvConfig): AppContainer => {
  const logger = new ConsoleLoggerAdapter();

  // Adaptadores secundarios (puertos de salida)
  const policyRepository = new InMemoryPolicyRepository();

  // Casos de uso
  const getAllPolicies = new GetAllPoliciesUseCase(policyRepository);
  const getPolicyById = new GetPolicyByIdUseCase(policyRepository);

  // Adaptadores primarios (puertos de entrada)
  const policyController = new PolicyController(getAllPolicies, getPolicyById, logger);
  const policyRoutes = createPolicyRoutes(policyController);

  return { env, logger, policyRoutes };
};
