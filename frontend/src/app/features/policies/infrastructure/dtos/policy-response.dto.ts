/**
 * Réplica exacta del JSON producido por el backend.
 * Ver docs/api-contract.md — cualquier cambio empieza aquí y en el mapper
 * del backend, nunca en la presentación.
 */
export interface PremiumDto {
  amount: number;
  currency: string;
}

export interface PolicyResponseDto {
  id: string;
  policyNumber: string;
  type: string;
  status: string;
  holderName: string;
  premium: PremiumDto;
  startDate: string;
}
