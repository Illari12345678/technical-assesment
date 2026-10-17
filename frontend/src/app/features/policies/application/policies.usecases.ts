import { InjectionToken } from '@angular/core';
import { GetAllPoliciesUseCase } from './get-all-policies.usecase';
import { GetPolicyByIdUseCase } from './get-policy-by-id.usecase';

/**
 * Tokens de DI: la presentación depende de los CASOS DE USO, no del
 * repositorio concreto. El ensamblaje ocurre en app.config.ts.
 */
export const GET_ALL_POLICIES_USECASE = new InjectionToken<GetAllPoliciesUseCase>(
  'GetAllPoliciesUseCase',
);

export const GET_POLICY_BY_ID_USECASE = new InjectionToken<GetPolicyByIdUseCase>(
  'GetPolicyByIdUseCase',
);
