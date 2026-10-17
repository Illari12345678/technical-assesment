import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PoliciesStore } from '../../../state/policies.store';
import { PolicyEntity } from '../../../domain/models/policy.entity';
import { PolicyCardComponent } from '../../components/policy-card/policy-card.component';

/**
 * Página smart: carga los datos vía el store y delega el rendering
 * al componente dumb PolicyCardComponent.
 */
@Component({
  selector: 'app-policy-list-page',
  standalone: true,
  imports: [PolicyCardComponent],
  templateUrl: './policy-list.page.html',
  styleUrl: './policy-list.page.css',
})
export class PolicyListPage {
  readonly store = inject(PoliciesStore);
  private readonly router = inject(Router);

  constructor() {
    this.store.loadPolicies();
  }

  openPolicy(policy: PolicyEntity): void {
    void this.router.navigate(['/policies', policy.id]);
  }
}
