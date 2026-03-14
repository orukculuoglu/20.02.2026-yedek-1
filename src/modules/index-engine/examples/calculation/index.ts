/**
 * Calculation Examples - Complete request/result pairs for different scenarios
 */

// Reliability Index Calculator Examples
export {
  healthyVehicleReliabilityRequest,
  healthyVehicleReliabilityResult,
} from './reliability-healthy-example';
export {
  degradedVehicleReliabilityRequest,
  degradedVehicleReliabilityResult,
} from './reliability-degraded-example';
export {
  lowConfidenceVehicleReliabilityRequest,
  lowConfidenceVehicleReliabilityResult,
} from './reliability-low-confidence-example';

// Maintenance Index Calculator Examples
export {
  healthyMaintenanceRequest,
  healthyMaintenanceResult,
} from './maintenance-index-examples';
export {
  overdueMaintenanceRequest,
  overdueMaintenanceResult,
} from './maintenance-index-examples';
export {
  lowConfidenceMaintenanceRequest,
  lowConfidenceMaintenanceResult,
} from './maintenance-index-examples';

// Insurance Risk Index Calculator Examples
export {
  lowRiskInsuranceRequest,
  lowRiskInsuranceResult,
} from './insurance-risk-index-examples';
export {
  elevatedRiskInsuranceRequest,
  elevatedRiskInsuranceResult,
} from './insurance-risk-index-examples';
export {
  lowConfidenceInsuranceRiskRequest,
  lowConfidenceInsuranceRiskResult,
} from './insurance-risk-index-examples';

// Operational Readiness Index Calculator Examples
export {
  readyOperationalRequest,
  readyOperationalResult,
} from './operational-readiness-index-examples';
export {
  degradedOperationalRequest,
  degradedOperationalResult,
} from './operational-readiness-index-examples';
export {
  lowConfidenceOperationalRequest,
  lowConfidenceOperationalResult,
} from './operational-readiness-index-examples';

// Legacy Examples (Phase 3 Infrastructure Validation)
export { reliabilityCalculationRequestExample, reliabilityCalculationResultExample } from './reliability-calculation-example';
export { maintenanceCalculationRequestExample, maintenanceCalculationResultExample } from './maintenance-calculation-example';
export { insuranceRiskCalculationRequestExample, insuranceRiskCalculationResultExample } from './insurance-risk-calculation-example';
