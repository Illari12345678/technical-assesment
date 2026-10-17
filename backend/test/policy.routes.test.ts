import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../src/app';
import { loadEnvConfig } from '../src/config/env.config';
import { createContainer } from '../src/container';
import { POLICY_SEED } from '../src/infrastructure/persistence/in-memory/policy-seed';

const buildApp = (): Express => createApp(createContainer(loadEnvConfig({} as NodeJS.ProcessEnv)));

const validBody = {
  policyNumber: 'POL-2026-9001',
  type: 'AUTO',
  holderName: 'Ana García',
  premium: { amount: 240.5, currency: 'EUR' },
  startDate: '2026-01-15',
};

describe('Policies API (integration)', () => {
  let app: Express;

  beforeEach(() => {
    // Fresh container per test: the in-memory store is mutated by POST/PUT.
    app = buildApp();
  });

  describe('GET /api/policies', () => {
    it('returns 200 with a paginated envelope of the seeded policies', async () => {
      const response = await request(app).get('/api/policies');

      expect(response.status).toBe(200);
      expect(response.body.meta).toEqual({
        page: 1,
        limit: 10,
        total: POLICY_SEED.length,
        totalPages: 1,
      });
      expect(response.body.data).toHaveLength(POLICY_SEED.length);
      expect(response.body.data[0]).toMatchObject({
        id: expect.any(String),
        policyNumber: expect.any(String),
        type: expect.any(String),
        status: expect.any(String),
        holderName: expect.any(String),
        premium: { amount: expect.any(Number), currency: expect.any(String) },
        startDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      });
    });

    it('filters by status (case-insensitive)', async () => {
      const response = await request(app).get('/api/policies?status=active');

      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(3);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data.every((p: { status: string }) => p.status === 'ACTIVE')).toBe(true);
    });

    it('filters by type and combines with status', async () => {
      const byType = await request(app).get('/api/policies?type=AUTO');
      expect(byType.body.meta.total).toBe(2);

      const combined = await request(app).get('/api/policies?type=AUTO&status=ACTIVE');
      expect(combined.body.meta.total).toBe(1);
      expect(combined.body.data[0].type).toBe('AUTO');
    });

    it('searches by holder name (partial, case-insensitive)', async () => {
      const response = await request(app).get('/api/policies?holderName=garc');

      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(1);
      expect(response.body.data[0].holderName).toContain('García');

      const empty = await request(app).get('/api/policies?holderName=nobody');
      expect(empty.body.meta.total).toBe(0);
      expect(empty.body.data).toEqual([]);
    });

    it('paginates and reports the correct meta', async () => {
      const page2 = await request(app).get('/api/policies?page=2&limit=2');

      expect(page2.status).toBe(200);
      expect(page2.body.data).toHaveLength(2);
      expect(page2.body.meta).toEqual({
        page: 2,
        limit: 2,
        total: POLICY_SEED.length,
        totalPages: Math.ceil(POLICY_SEED.length / 2),
      });
      expect(page2.body.data[0].id).not.toBe(POLICY_SEED[0]?.id);
    });

    it.each(['limit=0', 'limit=101', 'page=0', 'page=abc', 'status=WEIRD', 'type=SPACESHIP'])(
      'returns 400 for the invalid query "%s"',
      async (query) => {
        const response = await request(app).get(`/api/policies?${query}`);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      },
    );
  });

  describe('GET /api/policies/:id', () => {
    it('returns 200 with a single policy', async () => {
      const [seed] = POLICY_SEED;
      const response = await request(app).get(`/api/policies/${seed?.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(seed?.id);
      expect(response.body.premium).toEqual(seed?.premium);
    });

    it('returns 404 with a uniform error shape when the policy does not exist', async () => {
      const response = await request(app).get(
        '/api/policies/00000000-0000-4000-8000-000000000000',
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        code: 'POLICY_NOT_FOUND',
        message: expect.stringContaining('00000000-0000-4000-8000-000000000000'),
      });
    });

    it('returns 400 when the id is not a valid UUID', async () => {
      const response = await request(app).get('/api/policies/not-a-uuid');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/policies', () => {
    it('creates a policy (201), sets Location and makes it visible in the list', async () => {
      const response = await request(app).post('/api/policies').send(validBody);

      expect(response.status).toBe(201);
      expect(response.headers.location).toBe(`/api/policies/${response.body.id}`);
      expect(response.body).toMatchObject({
        policyNumber: 'POL-2026-9001',
        status: 'PENDING',
        holderName: 'Ana García',
      });

      const list = await request(app).get('/api/policies');
      expect(list.body.meta.total).toBe(POLICY_SEED.length + 1);
    });

    it('accepts an explicit, lower-cased status', async () => {
      const response = await request(app)
        .post('/api/policies')
        .send({ ...validBody, status: 'active' });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('ACTIVE');
    });

    it.each([
      ['missing holderName', { ...validBody, holderName: undefined }],
      ['non-positive premium', { ...validBody, premium: { amount: -1, currency: 'EUR' } }],
      ['unsupported currency', { ...validBody, premium: { amount: 10, currency: 'BTC' } }],
      ['malformed startDate', { ...validBody, startDate: '15-01-2026' }],
      ['unknown field', { ...validBody, surprise: true }],
    ])('returns 400 for %s', async (_label, body) => {
      const response = await request(app).post('/api/policies').send(body);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('returns 422 when the policyNumber already exists', async () => {
      const response = await request(app)
        .post('/api/policies')
        .send({ ...validBody, policyNumber: POLICY_SEED[0]?.policyNumber });

      expect(response.status).toBe(422);
      expect(response.body.code).toBe('POLICY_ALREADY_EXISTS');
    });

    it('returns 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/policies')
        .set('Content-Type', 'application/json')
        .send('{ not json');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_JSON');
    });
  });

  describe('PUT /api/policies/:id', () => {
    const updateBody = {
      type: 'HOME',
      holderName: 'Carlos Ruiz',
      premium: { amount: 100, currency: 'USD' },
      startDate: '2027-05-05',
    };

    it('updates the mutable fields and returns the resource', async () => {
      const target = POLICY_SEED[0]!;
      const response = await request(app).put(`/api/policies/${target.id}`).send({
        ...updateBody,
        status: 'ACTIVE',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: target.id,
        policyNumber: target.policyNumber,
        type: 'HOME',
        holderName: 'Carlos Ruiz',
        premium: { amount: 100, currency: 'USD' },
        status: 'ACTIVE',
      });

      const detail = await request(app).get(`/api/policies/${target.id}`);
      expect(detail.body.holderName).toBe('Carlos Ruiz');
    });

    it('returns 404 when the policy does not exist', async () => {
      const response = await request(app)
        .put('/api/policies/00000000-0000-4000-8000-000000000000')
        .send(updateBody);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('POLICY_NOT_FOUND');
    });

    it('returns 400 when the id is not a valid UUID', async () => {
      const response = await request(app).put('/api/policies/not-a-uuid').send(updateBody);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when the body is incomplete', async () => {
      const target = POLICY_SEED[0]!;
      const { holderName, ...incomplete } = updateBody;
      void holderName;

      const response = await request(app).put(`/api/policies/${target.id}`).send(incomplete);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('returns 422 on an illegal status transition (EXPIRED → ACTIVE)', async () => {
      const expired = POLICY_SEED.find((policy) => policy.status === 'EXPIRED')!;

      const response = await request(app)
        .put(`/api/policies/${expired.id}`)
        .send({ ...updateBody, status: 'ACTIVE' });

      expect(response.status).toBe(422);
      expect(response.body.code).toBe('INVALID_STATUS_TRANSITION');
    });
  });

  describe('unknown routes', () => {
    it('returns a uniform 404 for unmatched /api/* routes', async () => {
      const response = await request(app).get('/api/does-not-exist');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('ROUTE_NOT_FOUND');
    });
  });
});
