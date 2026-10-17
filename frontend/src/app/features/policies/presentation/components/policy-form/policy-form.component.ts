import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PolicyEntity } from '../../../domain/models/policy.entity';
import { NewPolicy, PolicyChanges } from '../../../domain/models/policy-input';
import {
  POLICY_TYPE_LABELS,
  POLICY_TYPES,
  PolicyTypeValue,
} from '../../../domain/models/value-objects/policy-type.vo';
import {
  POLICY_STATUSES,
  POLICY_STATUS_LABELS,
  PolicyStatusValue,
} from '../../../domain/models/value-objects/policy-status.vo';
import { SUPPORTED_CURRENCIES } from '../../../domain/models/value-objects/premium.vo';

export type PolicyFormMode = 'create' | 'edit';

type FieldName =
  | 'policyNumber'
  | 'type'
  | 'holderName'
  | 'premiumAmount'
  | 'premiumCurrency'
  | 'startDate'
  | 'status';

/**
 * Dumb reactive form: validates and emits the payload, knows nothing about
 * HTTP, the store or navigation.
 */
@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './policy-form.component.html',
  styleUrl: './policy-form.component.css',
})
export class PolicyFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() mode: PolicyFormMode = 'create';
  @Input() policy: PolicyEntity | null = null;
  @Input() submitting = false;

  @Output() readonly submitted = new EventEmitter<NewPolicy | PolicyChanges>();
  @Output() readonly cancelled = new EventEmitter<void>();

  readonly typeOptions = POLICY_TYPES.map((value) => ({ value, label: POLICY_TYPE_LABELS[value] }));
  readonly statusOptions = POLICY_STATUSES.map((value) => ({
    value,
    label: POLICY_STATUS_LABELS[value],
  }));
  readonly currencyOptions = SUPPORTED_CURRENCIES;

  readonly form = this.fb.nonNullable.group({
    policyNumber: ['', [Validators.required, Validators.pattern(/^POL-\d{4}-\d{4}$/i)]],
    type: ['AUTO' as PolicyTypeValue, [Validators.required]],
    holderName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    premiumAmount: [0, [Validators.required, Validators.min(0.01)]],
    premiumCurrency: ['EUR', [Validators.required]],
    startDate: ['', [Validators.required]],
    status: ['PENDING' as PolicyStatusValue, [Validators.required]],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['policy']) {
      this.patchFromPolicy();
    }
  }

  errorFor(field: FieldName): string | null {
    const control = this.form.controls[field] as AbstractControl;
    if (control.valid || !(control.touched || control.dirty)) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control.hasError('pattern')) {
      return 'El formato debe ser POL-AAAA-0000';
    }
    if (control.hasError('minlength')) {
      return 'Debe tener al menos 3 caracteres';
    }
    if (control.hasError('maxlength')) {
      return 'No puede superar los 120 caracteres';
    }
    if (control.hasError('min')) {
      return 'La prima debe ser mayor que 0';
    }
    return 'Valor inválido';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const changes: PolicyChanges = {
      type: value.type,
      holderName: value.holderName.trim(),
      premium: { amount: Number(value.premiumAmount), currency: value.premiumCurrency },
      startDate: value.startDate,
      status: value.status,
    };

    this.submitted.emit(
      this.mode === 'create' ? { policyNumber: value.policyNumber.trim(), ...changes } : changes,
    );
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private patchFromPolicy(): void {
    if (!this.policy) {
      return;
    }
    this.form.patchValue({
      policyNumber: this.policy.policyNumber,
      type: this.policy.type as PolicyTypeValue,
      holderName: this.policy.holderName,
      premiumAmount: this.policy.premium.amount,
      premiumCurrency: this.policy.premium.currency,
      startDate: this.policy.startDate.toISOString().slice(0, 10),
      status: this.policy.status.value,
    });
  }
}
