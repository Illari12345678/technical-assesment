import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PolicyRepository } from '../../domain/repositories/policy.repository';
import { PolicyEntity } from '../../domain/models/policy.entity';
import { PolicyResponseDto } from '../dtos/policy-response.dto';
import { PolicyMapper } from '../mappers/policy.mapper';

/**
 * Adaptador HTTP: implementa el puerto del dominio con HttpClient.
 * El único punto que conoce la URL del backend y la forma del JSON.
 */
export class HttpPolicyRepository implements PolicyRepository {
  constructor(
    private readonly http: HttpClient,
    private readonly apiUrl: string,
  ) {}

  findAll(): Observable<PolicyEntity[]> {
    return this.http
      .get<PolicyResponseDto[]>(`${this.apiUrl}/policies`)
      .pipe(map((dtos) => PolicyMapper.toEntities(dtos)));
  }

  findById(id: string): Observable<PolicyEntity> {
    return this.http
      .get<PolicyResponseDto>(`${this.apiUrl}/policies/${id}`)
      .pipe(map((dto) => PolicyMapper.toEntity(dto)));
  }
}
