import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiError } from './api-error';
import { apiErrorInterceptor } from './api-error.interceptor';

describe('apiErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('keeps the normalised backend error body', () => {
    let captured: ApiError | undefined;
    http.get('/api/policies/missing').subscribe({ error: (error: ApiError) => (captured = error) });

    httpMock
      .expectOne('/api/policies/missing')
      .flush(
        { statusCode: 404, code: 'POLICY_NOT_FOUND', message: 'Policy not found' },
        { status: 404, statusText: 'Not Found' },
      );

    expect(captured).toEqual({
      statusCode: 404,
      code: 'POLICY_NOT_FOUND',
      message: 'Policy not found',
    });
  });

  it('wraps non-contract error bodies into an ApiError', () => {
    let captured: ApiError | undefined;
    http.get('/api/policies').subscribe({ error: (error: ApiError) => (captured = error) });

    httpMock
      .expectOne('/api/policies')
      .flush('<html>Internal error</html>', { status: 500, statusText: 'Server Error' });

    expect(captured?.statusCode).toBe(500);
    expect(captured?.code).toBe('HTTP_ERROR');
  });

  it('maps connection failures to a network error', () => {
    let captured: ApiError | undefined;
    http.get('/api/policies').subscribe({ error: (error: ApiError) => (captured = error) });

    httpMock
      .expectOne('/api/policies')
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(captured?.statusCode).toBe(0);
    expect(captured?.code).toBe('NETWORK_ERROR');
  });
});
