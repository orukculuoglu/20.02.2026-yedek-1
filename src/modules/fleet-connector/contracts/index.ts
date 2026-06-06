/**
 * Fleet Connector Contracts
 * 
 * Core contract layer for fleet connector system integrations.
 * 
 * Exports all enums and interfaces used for fleet connector integration,
 * synchronization, service routing, and outcome tracking.
 * 
 * This is a contracts-only module with no runtime implementations.
 */

// Fleet Connector Configuration Contracts
export {
  FleetConnectorProviderType,
  FleetConnectorConnectionMode,
  FleetConnectorAccessMode,
  FleetConnectorStatus,
  FleetConnectorScope,
  type FleetConnectorConfig,
} from './fleet-connector-config.contract';

// External Fleet Record Contracts
export {
  ExternalFleetOperationalStatus,
  ExternalFleetRentalStatus,
  ExternalFleetMaintenanceStatus,
  type ExternalFleetVehicleRecord,
} from './fleet-external-record.contract';

// Fleet Normalization Contracts
export {
  FleetNormalizedVehicleSource,
  FleetNormalizedRecordStatus,
  type FleetNormalizedVehicleRecord,
} from './fleet-normalized-vehicle.contract';

export {
  FleetNormalizationIssueSeverity,
  FleetNormalizationIssueCode,
  type FleetNormalizationIssue,
} from './fleet-normalization-issue.contract';

export {
  FleetNormalizationResultStatus,
  type FleetNormalizationResult,
} from './fleet-normalization-result.contract';

export {
  FleetNormalizationPolicyStatus,
  FleetNormalizationRequiredField,
  type FleetNormalizationPolicy,
} from './fleet-normalization-policy.contract';

// Fleet Synchronization Record Contracts
export {
  FleetSyncDirection,
  FleetSyncStatus,
  FleetSyncErrorCode,
  type FleetExternalSyncRecord,
} from './fleet-sync-record.contract';

// Fleet Service Routing Contracts
export {
  FleetServiceRoutingSource,
  FleetServiceRoutingReasonCode,
  FleetServiceRoutingPriority,
  FleetServiceRoutingStatus,
  FleetServiceTargetType,
  type FleetServiceRoutingRequest,
} from './fleet-service-routing.contract';

// Fleet Service Outcome Contracts
export {
  FleetServiceOutcomeStatus,
  FleetServiceOutcomeResultCode,
  FleetServiceOutcomeNextAction,
  type FleetServiceRoutingOutcome,
} from './fleet-service-outcome.contract';

// Fleet Intake Evaluation Contracts
export {
  FleetIntakeEvaluationSource,
  type FleetIntakeEvaluationInput,
} from './fleet-intake-evaluation-input.contract';

export {
  FleetIntakeDataQualitySeverity,
  FleetIntakeDataQualityCode,
  type FleetIntakeDataQualityFinding,
} from './fleet-intake-data-quality.contract';

export {
  FleetIntakeReadinessSignalType,
  FleetIntakeReadinessReasonCode,
  type FleetIntakeReadinessSignal,
} from './fleet-intake-readiness-signal.contract';

export {
  FleetIntakeServiceCandidateStatus,
  type FleetIntakeServiceRoutingCandidate,
} from './fleet-intake-service-candidate.contract';

export {
  FleetIntakeEvaluationStatus,
  FleetIntakeOutcomeEligibility,
  type FleetIntakeEvaluationResult,
} from './fleet-intake-evaluation-result.contract';

export {
  FleetIntakeEvaluationPolicyStatus,
  FleetIntakeEvaluationRule,
  type FleetIntakeEvaluationPolicy,
} from './fleet-intake-evaluation-policy.contract';
