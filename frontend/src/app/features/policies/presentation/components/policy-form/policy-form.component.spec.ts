import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { PolicyFormComponent } from './policy-form.component';
import { PolicyEntity } from '../../../domain/models/policy.entity';
import { PolicyStatusVO } from '../../../domain/models/value-objects/policy-status.vo';
import { PremiumVO } from '../../../domain/models/value-objects/premium.vo';
import { NewPolicy, PolicyChanges } from '../../../domain/models/policy-input';

const buildPolicy = (): PolicyEntity =>
  new PolicyEntity(
    'policy-1',
    'POL-2026-0001',
    'HOME',
    PolicyStatusVO.from('ACTIVE'),
    'Ana García',
    PremiumVO.create(240.5, 'EUR'),
    new Date('2026-01-15'),
  );

describe('PolicyFormComponent', () => {
  let fixture: ComponentFixture<PolicyFormComponent>;
  let component: PolicyFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PolicyFormComponent] }).compileComponents();
    fixture = TestBed.createComponent(PolicyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts invalid in create mode', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('does not emit when the form is invalid and shows field errors', () => {
    const emitted: unknown[] = [];
    component.submitted.subscribe((payload) => emitted.push(payload));

    component.onSubmit();
    fixture.detectChanges();

    expect(emitted).toEqual([]);
    const errors = fixture.nativeElement.querySelectorAll('.form__error');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].textContent).toContain('obligatorio');
  });

  it('emits a create payload when the form is valid', () => {
    component.form.setValue({
      policyNumber: 'POL-2026-0001',
      type: 'AUTO',
      holderName: 'Ana García',
      premiumAmount: 240.5,
      premiumCurrency: 'EUR',
      startDate: '2026-01-15',
      status: 'PENDING',
    });
    const emitted: NewPolicy[] = [];
    component.submitted.subscribe((payload) => emitted.push(payload as NewPolicy));

    component.onSubmit();

    expect(emitted).toEqual([
      {
        policyNumber: 'POL-2026-0001',
        type: 'AUTO',
        holderName: 'Ana García',
        premium: { amount: 240.5, currency: 'EUR' },
        startDate: '2026-01-15',
        status: 'PENDING',
      },
    ]);
  });

  it('rejects a policy number with the wrong format', () => {
    component.form.controls.policyNumber.setValue('1234');
    component.form.controls.policyNumber.markAsTouched();

    expect(component.form.controls.policyNumber.hasError('pattern')).toBe(true);
    expect(component.errorFor('policyNumber')).toContain('POL-AAAA-0000');
  });

  it('patches the form in edit mode and emits changes without the policy number', () => {
    component.mode = 'edit';
    component.policy = buildPolicy();
    component.ngOnChanges({ policy: new SimpleChange(null, component.policy, true) });

    expect(component.form.controls.holderName.value).toBe('Ana García');
    expect(component.form.controls.type.value).toBe('HOME');
    expect(component.form.controls.premiumAmount.value).toBe(240.5);
    expect(component.form.controls.startDate.value).toBe('2026-01-15');

    const emitted: unknown[] = [];
    component.submitted.subscribe((payload) => emitted.push(payload));

    component.onSubmit();

    const payload = emitted[0] as PolicyChanges & { policyNumber?: string };
    expect(payload.holderName).toBe('Ana García');
    expect(payload.type).toBe('HOME');
    expect(payload.policyNumber).toBeUndefined();
  });

  it('emits a cancel event', () => {
    let cancelled = false;
    component.cancelled.subscribe(() => (cancelled = true));

    component.onCancel();

    expect(cancelled).toBe(true);
  });
});
