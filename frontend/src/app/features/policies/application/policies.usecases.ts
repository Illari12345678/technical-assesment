import { InjectionToken } from '@angular/core';
import { GetAllPoliciesUseCase } from './get-all-policies.usecase';
import { GetPolicyByIdUseCase } from './get-policy-by-id.usecase';

/**
 * DI tokens: presentation depends on the USE CASES, not on the concrete
 * repository. Assembly happens in app.config.ts.
 */
export const GET_ALL_POLICIES_USECASE = new InjectionToken<GetAllPoliciesUseCase>(
  'GetAllPoliciesUseCase',
);

export const GET_POLICY_BY_ID_USECASE = new InjectionToken<GetPolicyByIdUseCase>(
  'GetPolicyByIdUseCase',
);
