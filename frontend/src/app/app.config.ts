import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import {
  POLICY_REPOSITORY,
  PolicyRepository,
} from './features/policies/domain/repositories/policy.repository';
import { HttpPolicyRepository } from './features/policies/infrastructure/repositories/http-policy.repository';
import { GetAllPoliciesUseCase } from './features/policies/application/get-all-policies.usecase';
import { GetPolicyByIdUseCase } from './features/policies/application/get-policy-by-id.usecase';
import {
  GET_ALL_POLICIES_USECASE,
  GET_POLICY_BY_ID_USECASE,
} from './features/policies/application/policies.usecases';

/**
 * Frontend Composition Root: the only place where ports are bound to
 * concrete adapters (mirrors container.ts on the backend).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: POLICY_REPOSITORY,
      useFactory: (http: HttpClient) => new HttpPolicyRepository(http, environment.apiUrl),
      deps: [HttpClient],
    },
    {
      provide: GET_ALL_POLICIES_USECASE,
      useFactory: (repo: PolicyRepository) => new GetAllPoliciesUseCase(repo),
      deps: [POLICY_REPOSITORY],
    },
    {
      provide: GET_POLICY_BY_ID_USECASE,
      useFactory: (repo: PolicyRepository) => new GetPolicyByIdUseCase(repo),
      deps: [POLICY_REPOSITORY],
    },
  ],
};
