/**
 * Base domain exception. Carries a stable `code` and a suggested HTTP
 * `statusCode` so the HTTP layer stays decoupled from Express.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  readonly statusCode: number = 400;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
  }
}
