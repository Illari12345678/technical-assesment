import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PolicyEntity } from '../../../domain/models/policy.entity';

/**
 * Dumb component: receives a domain entity and emits its event.
 * Knows nothing about HTTP, DTOs or the store.
 */
@Component({
  selector: 'app-policy-card',
  standalone: true,
  templateUrl: './policy-card.component.html',
  styleUrl: './policy-card.component.css',
})
export class PolicyCardComponent {
  @Input({ required: true }) policy!: PolicyEntity;
  @Output() readonly selected = new EventEmitter<PolicyEntity>();
}
