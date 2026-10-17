import { z } from 'zod';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../../application/use-cases/get-all-policies.usecase';
import { POLICY_STATUSES } from '../../../domain/model/value-objects/policy-status.vo';
import { POLICY_TYPES } from '../../../domain/model/value-objects/policy-type.vo';
import { SUPPORTED_CURRENCIES } from '../../../domain/model/value-objects/premium.vo';

/** Upper bound for `limit` to keep responses bounded. */
export const MAX_LIMIT = 100;

/** Input validation: `:id` route parameter (UUID). */
export const GetPolicyParamsSchema = z.object({
  id: z.string().uuid(),
});

export type GetPolicyParams = z.infer<typeof GetPolicyParamsSchema>;

/** Case-insensitive enum: accepts the documented uppercase values (or any casing). */
const enumValue = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .pipe(z.enum(values));

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must follow the ISO format YYYY-MM-DD')
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'startDate must be a valid date');

const premiumBody = z.object({
  amount: z.number().positive(),
  currency: enumValue(SUPPORTED_CURRENCIES),
});

/** Input validation: filtering + pagination query params. */
export const ListPoliciesQuerySchema = z.object({
  status: enumValue(POLICY_STATUSES).optional(),
  type: enumValue(POLICY_TYPES).optional(),
  holderName: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export type ListPoliciesQuery = z.infer<typeof ListPoliciesQuerySchema>;

/** Input validation: POST body. */
export const CreatePolicyBodySchema = z
  .object({
    policyNumber: z.string().trim().min(1).max(50),
    type: enumValue(POLICY_TYPES),
    holderName: z.string().trim().min(1).max(120),
    premium: premiumBody,
    startDate: isoDate,
    status: enumValue(POLICY_STATUSES).optional(),
  })
  .strict();

export type CreatePolicyBody = z.infer<typeof CreatePolicyBodySchema>;

/** Input validation: PUT body (policyNumber and id are immutable). */
export const UpdatePolicyBodySchema = CreatePolicyBodySchema.omit({ policyNumber: true });

export type UpdatePolicyBody = z.infer<typeof UpdatePolicyBodySchema>;
