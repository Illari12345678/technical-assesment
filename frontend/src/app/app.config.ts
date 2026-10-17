import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { apiErrorInterceptor } from './core/http/api-error.interceptor';
import {
  POLICY_REPOSITORY,
  PolicyRepository,
} from './features/policies/domain/repositories/policy.repository';
import { HttpPolicyRepository } from './features/policies/infrastructure/repositories/http-policy.repository';
import { GetAllPoliciesUseCase } from './features/policies/application/get-all-policies.usecase';
import { GetPolicyByIdUseCase } from './features/policies/application/get-policy-by-id.usecase';
import { CreatePolicyUseCase } from './features/policies/application/create-policy.usecase';
import { UpdatePolicyUseCase } from './features/policies/application/update-policy.usecase';
import {
  CREATE_POLICY_USECASE,
  GET_ALL_POLICIES_USECASE,
  GET_POLICY_BY_ID_USECASE,
  UPDATE_POLICY_USECASE,
} from './features/policies/application/policies.usecases';

/**
 * Frontend Composition Root: the only place where ports are bound to
 * concrete adapters (mirrors container.ts on the backend).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiErrorInterceptor])),
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
    {
      provide: CREATE_POLICY_USECASE,
      useFactory: (repo: PolicyRepository) => new CreatePolicyUseCase(repo),
      deps: [POLICY_REPOSITORY],
    },
    {
      provide: UPDATE_POLICY_USECASE,
      useFactory: (repo: PolicyRepository) => new UpdatePolicyUseCase(repo),
      deps: [POLICY_REPOSITORY],
    },
  ],
};
