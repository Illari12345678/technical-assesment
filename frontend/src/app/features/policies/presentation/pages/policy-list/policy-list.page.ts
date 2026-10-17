import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PoliciesStore } from '../../../state/policies.store';
import { PolicyEntity } from '../../../domain/models/policy.entity';
import { PolicyCardComponent } from '../../components/policy-card/policy-card.component';
import {
  POLICY_STATUSES,
  POLICY_STATUS_LABELS,
  PolicyStatusValue,
} from '../../../domain/models/value-objects/policy-status.vo';

/**
 * Smart page: loads data via the store and delegates rendering to the
 * dumb PolicyCardComponent.
 */
@Component({
  selector: 'app-policy-list-page',
  standalone: true,
  imports: [PolicyCardComponent, ReactiveFormsModule],
  templateUrl: './policy-list.page.html',
  styleUrl: './policy-list.page.css',
})
export class PolicyListPage {
  readonly store = inject(PoliciesStore);
  private readonly router = inject(Router);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly statusOptions = POLICY_STATUSES.map((value) => ({
    value,
    label: POLICY_STATUS_LABELS[value],
  }));

  constructor() {
    this.store.loadPolicies();
    this.store.search(this.searchControl.valueChanges.pipe(takeUntilDestroyed()));
  }

  onStatusChange(value: string): void {
    this.store.setStatusFilter(value ? (value as PolicyStatusValue) : null);
  }

  openPolicy(policy: PolicyEntity): void {
    void this.router.navigate(['/policies', policy.id]);
  }

  createPolicy(): void {
    void this.router.navigate(['/policies', 'new']);
  }
}
