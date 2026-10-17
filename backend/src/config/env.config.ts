import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  CORS_ORIGINS: z.string().default('http://localhost:4200'),
});

export type EnvironmentName = z.infer<typeof EnvSchema>['NODE_ENV'];

export interface EnvConfig {
  environment: EnvironmentName;
  port: number;
  corsOrigins: string[];
  isProduction: boolean;
}

/**
 * Loads and validates environment variables (fail fast: invalid input → exit 1).
 */
export const loadEnvConfig = (raw: NodeJS.ProcessEnv = process.env): EnvConfig => {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  const { NODE_ENV, PORT, CORS_ORIGINS } = parsed.data;

  return {
    environment: NODE_ENV,
    port: PORT,
    corsOrigins: CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
    isProduction: NODE_ENV === 'production',
  };
};
