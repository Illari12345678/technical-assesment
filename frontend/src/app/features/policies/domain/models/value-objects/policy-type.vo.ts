export const POLICY_TYPES = ['AUTO', 'HOME', 'LIFE', 'HEALTH', 'TRAVEL'] as const;

export type PolicyTypeValue = (typeof POLICY_TYPES)[number];

export const POLICY_TYPE_LABELS: Record<PolicyTypeValue, string> = {
  AUTO: 'Automóvil',
  HOME: 'Hogar',
  LIFE: 'Vida',
  HEALTH: 'Salud',
  TRAVEL: 'Viaje',
};
