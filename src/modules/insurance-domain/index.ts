/**
 * Insurance Domain Module
 * Export all public APIs for insurance domain aggregate
 */

export {
  buildInsuranceDomainAggregate,
  getCoverageRiskLevel,
} from "./insuranceDomainEngine";

export { buildInsuranceDomainIndices } from "./insuranceDomainIndices";

export { emitInsuranceDomainSnapshot } from "./insuranceDomainDataEngineIntegration";

export {
  getInsuranceDomainInput,
  registerMockVehicle,
  clearMockInsuranceData,
} from "./adapters/mockInsuranceAdapter";

export type {
  InsuranceDomainAggregate,
  InsuranceDomainInput,
  InsurancePolicySnapshot,
  InsuranceEvent,
  InsuranceReasonCode,
  InsurancePolicyType,
  InsurancePolicyStatus,
  InsuranceEventType,
  InsuranceDomainEventPayload,
} from "./types";
