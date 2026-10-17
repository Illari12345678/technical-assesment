export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP'] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

/**
 * Value Object: policy premium. Positive amount + supported currency.
 */
export class Premium {
  private constructor(
    private readonly amount: number,
    private readonly currency: Currency,
  ) {}

  static create(amount: number, currency: string): Premium {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      throw new Error(`Premium amount must be a positive number, got ${amount}`);
    }
    const normalized = currency.trim().toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(normalized as Currency)) {
      throw new Error(
        `Invalid currency '${currency}'. Allowed values: ${SUPPORTED_CURRENCIES.join(', ')}`,
      );
    }
    return new Premium(amount, normalized as Currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): Currency {
    return this.currency;
  }

  toJSON(): { amount: number; currency: Currency } {
    return { amount: this.amount, currency: this.currency };
  }
}
