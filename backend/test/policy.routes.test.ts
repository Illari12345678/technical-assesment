import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../src/app';
import { loadEnvConfig } from '../src/config/env.config';
import { createContainer } from '../src/container';
import { POLICY_SEED } from '../src/infrastructure/persistence/in-memory/policy-seed';

const buildApp = (): Express => createApp(createContainer(loadEnvConfig({} as NodeJS.ProcessEnv)));

describe('Policies API (integration)', () => {
  let app: Express;

  beforeAll(() => {
    app = buildApp();
  });

  describe('GET /api/policies', () => {
    it('returns 200 with the seeded policies', async () => {
      const response = await request(app).get('/api/policies');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(POLICY_SEED.length);
      expect(response.body[0]).toMatchObject({
        policyNumber: expect.any(String),
        type: expect.any(String),
        status: expect.any(String),
        holderName: expect.any(String),
        premium: { amount: expect.any(Number), currency: expect.any(String) },
        startDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      });
    });
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
});
