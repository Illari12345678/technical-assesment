import { z } from 'zod';

/** Input validation: `:id` route parameter (UUID). */
export const GetPolicyParamsSchema = z.object({
  id: z.string().uuid(),
});

export type GetPolicyParams = z.infer<typeof GetPolicyParamsSchema>;
