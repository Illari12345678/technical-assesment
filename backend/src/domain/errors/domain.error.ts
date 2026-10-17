/**
 * Excepción base del dominio. Transporta un `code` estable y un
 * `statusCode` HTTP sugerido para la capa HTTP sin acoplar el dominio a Express.
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
