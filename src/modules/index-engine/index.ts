/**
 * Index Engine Module - Public API Surface
 * 
 * The Index Engine is the deterministic intelligence measurement layer
 * operating on top of the Vehicle Intelligence Graph outputs.
 * 
 * Phase 1: Index Type Model - Defines base domain contracts and types
 * Phase 2: Index Input Contracts - Canonical input model for calculation ingestion
 * Phase 3: Index Calculation Model - Deterministic calculation infrastructure
 * 
 * This module provides multi-phase architecture:
 * 1. Output contracts: IndexRecord, IndexMetadata, IndexExplanation, IndexBand
 * 2. Input contracts: IndexInput, IndexInputRef, IndexInputEvidence, IndexInputSnapshot, IndexInputFeatureSet
 * 3. Calculation contracts: IndexCalculationRequest/Result, IndexFactor, IndexScoreBreakdown, IndexPenalty
 * 4. Calculation services: Score normalization, factor weighting, confidence, penalties, band derivation
 * 5. Calculator interface: Base contract for all index calculators
 * 6. Validators: Contract validation for all types
 * 7. Examples: Concrete examples for output, input, and calculation contracts
 */

// ============================================================================
// PHASE 1: OUTPUT CONTRACTS (Index Results)
// ============================================================================

// Enums
export { IndexType } from './domain/enums/index-type';
export { IndexBand, calculateIndexBand } from './domain/enums/index-band';
export { IndexSubjectType } from './domain/enums/index-subject-type';

// Schemas
export type { IndexRecord } from './domain/schemas/index-record';
export type { IndexMetadata } from './domain/schemas/index-metadata';
export type { IndexExplanation } from './domain/schemas/index-explanation';

// Validators
export { IndexRecordValidator } from './domain/index-record-validator';
export { IndexMetadataValidator } from './domain/index-metadata-validator';
export { IndexExplanationValidator } from './domain/index-explanation-validator';

// ============================================================================
// PHASE 2: INPUT CONTRACTS (Calculator Inputs)
// ============================================================================

// Input Enums
export { EvidenceType, RefType, RelationType } from './domain/input/enums';

// Input Schemas
export type { IndexInput } from './domain/input/schemas/index-input';
export type { IndexInputRef } from './domain/input/schemas/index-input-ref';
export type { IndexInputEvidence } from './domain/input/schemas/index-input-evidence';
export type { IndexInputSnapshot } from './domain/input/schemas/index-input-snapshot';
export type { IndexInputFeatureSet } from './domain/input/schemas/index-input-feature-set';

// Input Validators
export { IndexInputValidator } from './domain/input/index-input-validator';
export { IndexInputRefValidator } from './domain/input/index-input-ref-validator';
export { IndexInputEvidenceValidator } from './domain/input/index-input-evidence-validator';
export { IndexInputSnapshotValidator } from './domain/input/index-input-snapshot-validator';
export { IndexInputFeatureSetValidator } from './domain/input/index-input-feature-set-validator';

// ============================================================================
// PHASE 3: CALCULATION MODEL CONTRACTS
// ============================================================================

// Calculation Enums
export { PenaltyType, NormalizationStrategy } from './domain/calculation/enums';

// Calculation Schemas
export type { IndexCalculationRequest, WeightingProfile } from './domain/calculation/schemas/index-calculation-request';
export type { IndexCalculationResult } from './domain/calculation/schemas/index-calculation-result';
export type { IndexFactor } from './domain/calculation/schemas/index-factor';
export type { IndexScoreBreakdown } from './domain/calculation/schemas/index-score-breakdown';
export type { IndexPenalty } from './domain/calculation/schemas/index-penalty';
export type { IndexNormalizationRule } from './domain/calculation/schemas/index-normalization-rule';

// Calculation Validators
export { IndexCalculationRequestValidator } from './domain/calculation/index-calculation-request-validator';
export { IndexCalculationResultValidator } from './domain/calculation/index-calculation-result-validator';

// ============================================================================
// CALCULATION SERVICES (Shared Infrastructure)
// ============================================================================

export {
  ScoreNormalizationService,
  FactorWeightingService,
  ConfidenceNormalizationService,
  PenaltyApplicationService,
  BandDerivationService,
} from './domain/calculation/services';

// ============================================================================
// CALCULATORS & CALCULATOR INTERFACE
// ============================================================================

// Base interface that all calculators implement
export type { IIndexCalculator } from './domain/calculation/index-calculator';

// Individual Index Type Calculators
export {
  ReliabilityIndexCalculator,
  MaintenanceIndexCalculator,
  InsuranceRiskIndexCalculator,
  OperationalReadinessIndexCalculator,
  DataQualityIndexCalculator,
} from './domain/calculation/calculators';

// ============================================================================
// EXAMPLES
// ============================================================================

// Phase 1 Output Examples
export {
  reliabilityIndexExample,
  maintenanceIndexExample,
  insuranceRiskIndexExample,
  operationalReadinessIndexExample,
  dataQualityIndexExample,
} from './examples';

// Phase 2 Input Examples
export {
  vehicleInputExample,
  componentInputExample,
  fleetInputExample,
} from './examples';

// Phase 3 Calculation Examples - Infrastructure Validation
export {
  reliabilityCalculationRequestExample,
  reliabilityCalculationResultExample,
  maintenanceCalculationRequestExample,
  maintenanceCalculationResultExample,
  insuranceRiskCalculationRequestExample,
  insuranceRiskCalculationResultExample,
} from './examples';

// Phase 4 Calculator Examples - Reliability Index Scenarios
export {
  healthyVehicleReliabilityRequest,
  healthyVehicleReliabilityResult,
  degradedVehicleReliabilityRequest,
  degradedVehicleReliabilityResult,
  lowConfidenceVehicleReliabilityRequest,
  lowConfidenceVehicleReliabilityResult,
} from './examples';

// Phase 4 Calculator Examples - Maintenance Index Scenarios
export {
  healthyMaintenanceRequest,
  healthyMaintenanceResult,
  overdueMaintenanceRequest,
  overdueMaintenanceResult,
  lowConfidenceMaintenanceRequest,
  lowConfidenceMaintenanceResult,
} from './examples';

// Phase 4 Calculator Examples - Insurance Risk Index Scenarios
export {
  lowRiskInsuranceRequest,
  lowRiskInsuranceResult,
  elevatedRiskInsuranceRequest,
  elevatedRiskInsuranceResult,
  lowConfidenceInsuranceRiskRequest,
  lowConfidenceInsuranceRiskResult,
} from './examples';

// Phase 4 Calculator Examples - Operational Readiness Index Scenarios
export {
  readyOperationalRequest,
  readyOperationalResult,
  degradedOperationalRequest,
  degradedOperationalResult,
  lowConfidenceOperationalRequest,
  lowConfidenceOperationalResult,
} from './examples';

// Phase 4 Calculator Examples - Data Quality Index Scenarios
export {
  highQualityDataRequest,
  highQualityDataResult,
  degradedDataQualityRequest,
  degradedDataQualityResult,
  lowConfidenceDataQualityRequest,
  lowConfidenceDataQualityResult,
} from './examples';
