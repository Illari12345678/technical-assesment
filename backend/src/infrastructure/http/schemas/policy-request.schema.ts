import { z } from 'zod';

/** Validación de entrada: parámetro de ruta `:id` (UUID). */
export const GetPolicyParamsSchema = z.object({
  id: z.string().uuid(),
});

export type GetPolicyParams = z.infer<typeof GetPolicyParamsSchema>;
