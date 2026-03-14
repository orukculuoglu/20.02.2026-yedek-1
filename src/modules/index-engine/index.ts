/**
 * Index Engine Module - Public API Surface
 * 
 * The Index Engine is the deterministic intelligence measurement layer
 * operating on top of the Vehicle Intelligence Graph outputs.
 * 
 * Phase 1: Index Type Model - Defines base domain contracts and types
 * Phase 2: Index Input Contracts - Canonical input model for calculation ingestion
 * 
 * This module provides:
 * - IndexType enum: Types of indices (RELIABILITY, MAINTENANCE, INSURANCE_RISK, etc.)
 * - IndexBand enum: Classification ranges derived from numerical scores
 * - IndexSubjectType enum: Types of entities that can be indexed
 * - IndexRecord interface: Core domain model for index measurements
 * - IndexMetadata interface: Traceability and context information
 * - IndexExplanation interface: Human-readable interpretation
 * - Validators: Contract validation and business rule enforcement
 * - IndexInput interface: Canonical input model for calculators
 * - IndexInputRef, Evidence, Snapshot, FeatureSet: Input sub-contracts
 * - Input validators: Complete contract validation
 * - Examples: Concrete examples for all contract types
 */

// Phase 1: Output Contracts (Index Results)
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

// Phase 2: Input Contracts (Calculator Inputs)
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

// Examples (Phase 1 Output Examples)
export {
  reliabilityIndexExample,
  maintenanceIndexExample,
  insuranceRiskIndexExample,
  operationalReadinessIndexExample,
  dataQualityIndexExample,
  vehicleInputExample,
  componentInputExample,
  fleetInputExample,
} from './examples';
