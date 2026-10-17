export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP'] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

/**
 * Value Object: prima de la póliza. Importe positivo + moneda soportada.
 */
export class PremiumVO {
  private constructor(
    readonly amount: number,
    readonly currency: Currency,
  ) {}

  static create(amount: number, currency: string): PremiumVO {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      throw new Error(`Premium amount must be a positive number, got ${amount}`);
    }
    const normalized = currency.trim().toUpperCase();
    if (!(SUPPORTED_CURRENCIES as readonly string[]).includes(normalized)) {
      throw new Error(
        `Invalid currency '${currency}'. Allowed values: ${SUPPORTED_CURRENCIES.join(', ')}`,
      );
    }
    return new PremiumVO(amount, normalized as Currency);
  }

  format(): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }
}
