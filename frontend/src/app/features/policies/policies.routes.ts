import { Routes } from '@angular/router';
import { PolicyListPage } from './presentation/pages/policy-list/policy-list.page';
import { PolicyDetailPage } from './presentation/pages/policy-detail/policy-detail.page';

/** Lazy-loaded: el feature se carga bajo `/policies`. */
export const POLICIES_ROUTES: Routes = [
  { path: '', component: PolicyListPage },
  { path: ':id', component: PolicyDetailPage },
];
