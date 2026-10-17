import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PoliciesStore } from '../../../state/policies.store';
import { NewPolicy, PolicyChanges } from '../../../domain/models/policy-input';
import { PolicyFormComponent } from '../../components/policy-form/policy-form.component';

/**
 * Smart page shared by create (`/policies/new`) and edit (`/policies/:id/edit`).
 * Delegates validation/rendering to the dumb PolicyFormComponent.
 */
@Component({
  selector: 'app-policy-form-page',
  standalone: true,
  imports: [PolicyFormComponent, RouterLink],
  templateUrl: './policy-form.page.html',
  styleUrl: './policy-form.page.css',
})
export class PolicyFormPage {
  readonly store = inject(PoliciesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly policyId = this.route.snapshot.paramMap.get('id');
  readonly isEdit = this.policyId !== null;

  constructor() {
    if (this.policyId) {
      this.store.loadPolicy(this.policyId);
    }
  }

  onSubmit(payload: NewPolicy | PolicyChanges): void {
    if (this.policyId) {
      this.store.updatePolicy(this.policyId, payload as PolicyChanges).subscribe({
        next: () => void this.router.navigate(['/policies', this.policyId]),
        error: () => undefined,
      });
      return;
    }

    this.store.createPolicy(payload as NewPolicy).subscribe({
      next: () => void this.router.navigate(['/policies']),
      error: () => undefined,
    });
  }

  onCancel(): void {
    void this.router.navigate(['/policies']);
  }
}
