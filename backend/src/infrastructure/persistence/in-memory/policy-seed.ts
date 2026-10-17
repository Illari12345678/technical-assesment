import { PolicyRecord } from '../mapper/policy.mapper';

/**
 * Seed data for the in-memory repository.
 */
export const POLICY_SEED: PolicyRecord[] = [
  {
    id: '3f1a8c9e-1f0a-4a5e-9c3d-6f2b8d1e4a70',
    policyNumber: 'POL-2026-0001',
    type: 'AUTO',
    status: 'ACTIVE',
    holderName: 'Ana García López',
    premium: { amount: 240.5, currency: 'EUR' },
    startDate: '2026-01-15',
  },
  {
    id: '7b2c4d6e-8a1f-4c3e-b5d7-9e0f1a2b3c4d',
    policyNumber: 'POL-2026-0002',
    type: 'HOME',
    status: 'ACTIVE',
    holderName: 'Carlos Ruiz Martín',
    premium: { amount: 480.0, currency: 'EUR' },
    startDate: '2026-02-01',
  },
  {
    id: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    policyNumber: 'POL-2025-0117',
    type: 'LIFE',
    status: 'PENDING',
    holderName: 'María Fernández Soto',
    premium: { amount: 720.9, currency: 'EUR' },
    startDate: '2026-03-20',
  },
  {
    id: 'c5d6e7f8-9a0b-4c1d-8e2f-3a4b5c6d7e8f',
    policyNumber: 'POL-2025-0093',
    type: 'TRAVEL',
    status: 'EXPIRED',
    holderName: 'Javier Torres Peña',
    premium: { amount: 89.99, currency: 'USD' },
    startDate: '2025-06-10',
  },
  {
    id: 'e8f9a0b1-c2d3-4e4f-8a5b-6c7d8e9f0a1b',
    policyNumber: 'POL-2026-0004',
    type: 'HEALTH',
    status: 'ACTIVE',
    holderName: 'Lucía Navarro Díaz',
    premium: { amount: 1150.0, currency: 'EUR' },
    startDate: '2026-01-01',
  },
  {
    id: 'f0a1b2c3-d4e5-4f6a-8b7c-9d0e1f2a3b4c',
    policyNumber: 'POL-2024-0342',
    type: 'AUTO',
    status: 'CANCELLED',
    holderName: 'Pablo Moreno Iglesias',
    premium: { amount: 310.75, currency: 'GBP' },
    startDate: '2024-11-05',
  },
];
