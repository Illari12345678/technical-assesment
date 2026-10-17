/**
 * Exact replica of the JSON produced by the backend.
 * See docs/api-contract.md — any change starts here and in the backend
 * mapper, never in the presentation layer.
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
