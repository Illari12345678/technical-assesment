import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PolicyRepository } from '../../domain/repositories/policy.repository';
import { PolicyEntity } from '../../domain/models/policy.entity';
import { PolicyPage } from '../../domain/models/policy-page';
import { PolicyQuery } from '../../domain/models/policy-query';
import { NewPolicy, PolicyChanges } from '../../domain/models/policy-input';
import {
  CreatePolicyRequestDto,
  PaginatedPoliciesDto,
  PolicyResponseDto,
  UpdatePolicyRequestDto,
} from '../dtos/policy-response.dto';
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

  findAll(query: PolicyQuery): Observable<PolicyPage> {
    return this.http
      .get<PaginatedPoliciesDto>(`${this.apiUrl}/policies`, { params: this.toParams(query) })
      .pipe(map((dto) => PolicyMapper.toPage(dto)));
  }

  findById(id: string): Observable<PolicyEntity> {
    return this.http
      .get<PolicyResponseDto>(`${this.apiUrl}/policies/${id}`)
      .pipe(map((dto) => PolicyMapper.toEntity(dto)));
  }

  create(policy: NewPolicy): Observable<PolicyEntity> {
    const body: CreatePolicyRequestDto = { ...policy };
    return this.http
      .post<PolicyResponseDto>(`${this.apiUrl}/policies`, body)
      .pipe(map((dto) => PolicyMapper.toEntity(dto)));
  }

  update(id: string, changes: PolicyChanges): Observable<PolicyEntity> {
    const body: UpdatePolicyRequestDto = { ...changes };
    return this.http
      .put<PolicyResponseDto>(`${this.apiUrl}/policies/${id}`, body)
      .pipe(map((dto) => PolicyMapper.toEntity(dto)));
  }

  private toParams(query: PolicyQuery): HttpParams {
    let params = new HttpParams();
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.type) {
      params = params.set('type', query.type);
    }
    if (query.holderName) {
      params = params.set('holderName', query.holderName);
    }
    if (query.page !== undefined) {
      params = params.set('page', String(query.page));
    }
    if (query.limit !== undefined) {
      params = params.set('limit', String(query.limit));
    }
    return params;
  }
}
