import { randomUUID } from 'node:crypto';

/**
 * Value Object: identificador inmutable de una póliza.
 * Se autogenera con UUID v4 o se reconstruye desde persistencia.
 */
export class PolicyId {
  private constructor(private readonly value: string) {}

  static create(): PolicyId {
    return new PolicyId(randomUUID());
  }

  static from(value: string): PolicyId {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new Error('PolicyId cannot be empty');
    }
    return new PolicyId(trimmed);
  }

  equals(other: PolicyId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
