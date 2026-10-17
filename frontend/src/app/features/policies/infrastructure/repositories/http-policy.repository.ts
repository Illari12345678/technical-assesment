import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PolicyRepository } from '../../domain/repositories/policy.repository';
import { PolicyEntity } from '../../domain/models/policy.entity';
import { PolicyResponseDto } from '../dtos/policy-response.dto';
import { PolicyMapper } from '../mappers/policy.mapper';

/**
 * HTTP adapter: implements the domain port with HttpClient.
 * The only place that knows the backend URL and the JSON shape.
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
