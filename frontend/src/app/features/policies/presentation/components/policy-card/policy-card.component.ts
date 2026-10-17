import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PolicyEntity } from '../../../domain/models/policy.entity';

/**
 * Componente dumb: recibe una entidad de dominio y emite su evento.
 * No conoce HTTP, DTOs ni el store.
 */
@Component({
  selector: 'app-policy-card',
  standalone: true,
  templateUrl: './policy-card.component.html',
  styleUrl: './policy-card.component.css',
})
export class PolicyCardComponent {
  @Input({ required: true }) policy!: PolicyEntity;
  @Output() readonly select = new EventEmitter<PolicyEntity>();
}
