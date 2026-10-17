import { Policy } from '../model/policy';
import { PolicyId } from '../model/value-objects/policy-id.vo';

/**
 * Puerto de salida secundario: el dominio define QUÉ necesita persistir;
 * la infraestructura decide CÓMO.
 */
export interface PolicyRepositoryPort {
  findAll(): Promise<Policy[]>;
  findById(id: PolicyId): Promise<Policy | null>;
}
