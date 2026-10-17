import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PoliciesStore } from '../../../state/policies.store';

/**
 * Página smart de detalle: carga la póliza por id (ruta) vía el store.
 */
@Component({
  selector: 'app-policy-detail-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './policy-detail.page.html',
  styleUrl: './policy-detail.page.css',
})
export class PolicyDetailPage {
  readonly store = inject(PoliciesStore);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.route.paramMap
      .pipe(map((params) => params.get('id') ?? ''))
      .subscribe((id) => this.store.loadPolicy(id));
  }
}
