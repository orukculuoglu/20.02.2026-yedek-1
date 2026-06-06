/**
 * Fleet Intake Evaluator
 * 
 * Pure deterministic evaluator for normalized fleet records.
 * 
 * This evaluator:
 * - Takes a normalized record and optional policy
 * - Generates enum-based data quality findings
 * - Generates enum-based readiness signals
 * - Generates candidate-only service routing suggestions
 * - Aggregates into a complete evaluation result
 * - Never generates IDs or timestamps
 * - Never mutates inputs
 * - Never calls external services
 * - Never emits events
 * - Remains fully deterministic
 */

import {
  FleetIntakeDataQualityCode,
  FleetIntakeDataQualitySeverity,
  FleetIntakeDataQualityFinding,
  FleetIntakeReadinessSignalType,
  FleetIntakeReadinessReasonCode,
  FleetIntakeReadinessSignal,
  FleetIntakeServiceCandidateStatus,
  FleetIntakeServiceRoutingCandidate,
  FleetIntakeEvaluationStatus,
  FleetIntakeOutcomeEligibility,
  FleetIntakeEvaluationResult,
  FleetServiceRoutingSource,
  FleetServiceRoutingReasonCode,
  FleetServiceRoutingPriority,
  FleetServiceTargetType,
  FleetNormalizedRecordStatus,
  ExternalFleetOperationalStatus,
  ExternalFleetRentalStatus,
  ExternalFleetMaintenanceStatus,
} from '../contracts';

import { FleetIntakeEvaluatorRuntimeInput } from './fleet-intake-evaluator.input';

/**
 * evaluateFleetConnectorIntake
 * 
 * Pure deterministic evaluator for fleet connector records.
 * 
 * Takes a normalized record and generates findings, signals, and candidates
 * based on data quality, status consistency, and maintenance needs.
 * 
 * Determinism guarantees:
 * - All IDs are from caller-provided arrays, consumed in order
 * - No internal ID generation
 * - No internal timestamp generation
 * - No network calls
 * - No mutation of inputs
 * - No event emission
 * - Fully reproducible given same input
 * 
 * @param input - Evaluator runtime input (all IDs/timestamps caller-provided)
 * @returns Evaluation result with findings, signals, and candidates
 */
export function evaluateFleetConnectorIntake(
  input: FleetIntakeEvaluatorRuntimeInput
): FleetIntakeEvaluationResult {
  const {
    evaluationInput,
    policy,
    evaluationResultId,
    createdAt,
    generatedFindingIds,
    generatedSignalIds,
    generatedCandidateIds,
  } = input;

  const { normalizedRecord, connectorId, tenantId, fleetId } = evaluationInput;

  // ID consumption tracking - never mutate original arrays
  let findingIdIndex = 0;
  let signalIdIndex = 0;
  let candidateIdIndex = 0;

  const findings: FleetIntakeDataQualityFinding[] = [];
  const signals: FleetIntakeReadinessSignal[] = [];
  const candidates: FleetIntakeServiceRoutingCandidate[] = [];

  // ============================================
  // PHASE 1: Data Quality Findings
  // ============================================

  // Helper: consume a finding ID if available
  const getNextFindingId = (): string | undefined => {
    if (findingIdIndex < generatedFindingIds.length) {
      return generatedFindingIds[findingIdIndex++];
    }
    return undefined;
  };

  // Check required fields
  if (
    !normalizedRecord.operationalStatus ||
    !normalizedRecord.rentalStatus ||
    !normalizedRecord.maintenanceStatus ||
    !normalizedRecord.sourceUpdatedAt ||
    !normalizedRecord.connectorId ||
    !normalizedRecord.externalRecordRef
  ) {
    const findingId = getNextFindingId();
    if (findingId) {
      findings.push({
        findingId,
        evaluationInputId: evaluationInput.evaluationInputId,
        connectorId,
        tenantId,
        fleetId,
        severity: FleetIntakeDataQualitySeverity.CRITICAL,
        code: FleetIntakeDataQualityCode.MISSING_REQUIRED_FIELD,
        createdAt,
      });
    }
  }

  // Check mileage validity
  if (normalizedRecord.currentMileage !== undefined && normalizedRecord.currentMileage < 0) {
    const findingId = getNextFindingId();
    if (findingId) {
      findings.push({
        findingId,
        evaluationInputId: evaluationInput.evaluationInputId,
        connectorId,
        tenantId,
        fleetId,
        severity: FleetIntakeDataQualitySeverity.ERROR,
        code: FleetIntakeDataQualityCode.INVALID_MILEAGE,
        createdAt,
      });
    }
  }

  // Check for stale source record (only if status indicates it)
  if (
    normalizedRecord.status === FleetNormalizedRecordStatus.QUARANTINED ||
    normalizedRecord.status === FleetNormalizedRecordStatus.REJECTED
  ) {
    const findingId = getNextFindingId();
    if (findingId) {
      findings.push({
        findingId,
        evaluationInputId: evaluationInput.evaluationInputId,
        connectorId,
        tenantId,
        fleetId,
        severity: FleetIntakeDataQualitySeverity.WARNING,
        code: FleetIntakeDataQualityCode.STALE_SOURCE_RECORD,
        createdAt,
      });
    }
  }

  // Check for inconsistent status: out-of-service but available for rental
  if (
    normalizedRecord.operationalStatus === ExternalFleetOperationalStatus.OUT_OF_SERVICE &&
    normalizedRecord.rentalStatus === ExternalFleetRentalStatus.AVAILABLE
  ) {
    const findingId = getNextFindingId();
    if (findingId) {
      findings.push({
        findingId,
        evaluationInputId: evaluationInput.evaluationInputId,
        connectorId,
        tenantId,
        fleetId,
        severity: FleetIntakeDataQualitySeverity.ERROR,
        code: FleetIntakeDataQualityCode.INCONSISTENT_STATUS,
        createdAt,
      });
    }
  }

  // Check for unsupported status combination: rented and inactive
  if (
    normalizedRecord.rentalStatus === ExternalFleetRentalStatus.RENTED &&
    normalizedRecord.operationalStatus === ExternalFleetOperationalStatus.INACTIVE
  ) {
    const findingId = getNextFindingId();
    if (findingId) {
      findings.push({
        findingId,
        evaluationInputId: evaluationInput.evaluationInputId,
        connectorId,
        tenantId,
        fleetId,
        severity: FleetIntakeDataQualitySeverity.ERROR,
        code: FleetIntakeDataQualityCode.UNSUPPORTED_STATUS_COMBINATION,
        createdAt,
      });
    }
  }

  // Check for blocked rental state
  if (normalizedRecord.rentalStatus === ExternalFleetRentalStatus.BLOCKED) {
    const findingId = getNextFindingId();
    if (findingId) {
      findings.push({
        findingId,
        evaluationInputId: evaluationInput.evaluationInputId,
        connectorId,
        tenantId,
        fleetId,
        severity: FleetIntakeDataQualitySeverity.WARNING,
        code: FleetIntakeDataQualityCode.BLOCKED_RENTAL_STATE,
        createdAt,
      });
    }
  }

  // Check for service state conflict: service-open while available for rental
  if (
    normalizedRecord.maintenanceStatus === ExternalFleetMaintenanceStatus.SERVICE_OPEN &&
    normalizedRecord.rentalStatus === ExternalFleetRentalStatus.AVAILABLE
  ) {
    const findingId = getNextFindingId();
    if (findingId) {
      findings.push({
        findingId,
        evaluationInputId: evaluationInput.evaluationInputId,
        connectorId,
        tenantId,
        fleetId,
        severity: FleetIntakeDataQualitySeverity.ERROR,
        code: FleetIntakeDataQualityCode.SERVICE_STATE_CONFLICT,
        createdAt,
      });
    }
  }

  // Check for incomplete operational context
  if (!normalizedRecord.brand || !normalizedRecord.model || !normalizedRecord.year) {
    const findingId = getNextFindingId();
    if (findingId) {
      findings.push({
        findingId,
        evaluationInputId: evaluationInput.evaluationInputId,
        connectorId,
        tenantId,
        fleetId,
        severity: FleetIntakeDataQualitySeverity.WARNING,
        code: FleetIntakeDataQualityCode.INCOMPLETE_OPERATIONAL_CONTEXT,
        createdAt,
      });
    }
  }

  // ============================================
  // PHASE 2: Readiness Signal (one main signal)
  // ============================================

  // Helper: consume a signal ID if available
  const getNextSignalId = (): string | undefined => {
    if (signalIdIndex < generatedSignalIds.length) {
      return generatedSignalIds[signalIdIndex++];
    }
    return undefined;
  };

  // Determine readiness signal type based on findings and status
  let readinessType: FleetIntakeReadinessSignalType = FleetIntakeReadinessSignalType.READY;
  let readinessReason: FleetIntakeReadinessReasonCode =
    FleetIntakeReadinessReasonCode.CLEAN_OPERATIONAL_STATE;

  // Check for critical findings or quarantined status
  const hasCriticalFindings = findings.some(
    (f) => f.severity === FleetIntakeDataQualitySeverity.CRITICAL
  );
  if (hasCriticalFindings || normalizedRecord.status === FleetNormalizedRecordStatus.QUARANTINED) {
    readinessType = FleetIntakeReadinessSignalType.QUARANTINE;
    readinessReason = FleetIntakeReadinessReasonCode.MANUAL_REVIEW_REQUIRED;
  }
  // Check for blocked status
  else if (normalizedRecord.rentalStatus === ExternalFleetRentalStatus.BLOCKED) {
    readinessType = FleetIntakeReadinessSignalType.BLOCKED;
    readinessReason = FleetIntakeReadinessReasonCode.RENTAL_STATE_BLOCKED;
  } else if (normalizedRecord.operationalStatus === ExternalFleetOperationalStatus.OUT_OF_SERVICE) {
    readinessType = FleetIntakeReadinessSignalType.BLOCKED;
    readinessReason = FleetIntakeReadinessReasonCode.RENTAL_STATE_BLOCKED;
  }
  // Check for maintenance requiring action
  else if (
    normalizedRecord.maintenanceStatus === ExternalFleetMaintenanceStatus.OVERDUE ||
    normalizedRecord.maintenanceStatus === ExternalFleetMaintenanceStatus.SERVICE_OPEN
  ) {
    readinessType = FleetIntakeReadinessSignalType.MAINTENANCE_REQUIRED;
    readinessReason =
      normalizedRecord.maintenanceStatus === ExternalFleetMaintenanceStatus.OVERDUE
        ? FleetIntakeReadinessReasonCode.MAINTENANCE_OVERDUE
        : FleetIntakeReadinessReasonCode.SERVICE_OPEN;
  }
  // Check for warnings or need for approval
  else if (
    findings.some(
      (f) =>
        f.severity === FleetIntakeDataQualitySeverity.WARNING ||
        f.severity === FleetIntakeDataQualitySeverity.ERROR
    ) ||
    normalizedRecord.status === FleetNormalizedRecordStatus.ACCEPTED_WITH_WARNINGS
  ) {
    readinessType = FleetIntakeReadinessSignalType.APPROVAL_REQUIRED;
    readinessReason = FleetIntakeReadinessReasonCode.INCOMPLETE_OPERATIONAL_CONTEXT;
  }
  // Check for monitoring (maintenance due soon)
  else if (normalizedRecord.maintenanceStatus === ExternalFleetMaintenanceStatus.DUE_SOON) {
    readinessType = FleetIntakeReadinessSignalType.MONITOR;
    readinessReason = FleetIntakeReadinessReasonCode.MAINTENANCE_DUE;
  }
  // Otherwise, ready to go
  else if (
    normalizedRecord.operationalStatus === ExternalFleetOperationalStatus.ACTIVE &&
    normalizedRecord.rentalStatus === ExternalFleetRentalStatus.AVAILABLE &&
    normalizedRecord.maintenanceStatus === ExternalFleetMaintenanceStatus.CLEAR &&
    findings.length === 0
  ) {
    readinessType = FleetIntakeReadinessSignalType.READY;
    readinessReason = FleetIntakeReadinessReasonCode.CLEAN_OPERATIONAL_STATE;
  }

  // Generate the readiness signal
  const signalId = getNextSignalId();
  if (signalId) {
    signals.push({
      signalId,
      evaluationInputId: evaluationInput.evaluationInputId,
      connectorId,
      tenantId,
      fleetId,
      vehicleId: undefined, // Optional - not set in this evaluation layer
      signalType: readinessType,
      reasonCode: readinessReason,
      createdAt,
    });
  }

  // ============================================
  // PHASE 3: Service Routing Candidates
  // ============================================

  // Helper: consume a candidate ID if available
  const getNextCandidateId = (): string | undefined => {
    if (candidateIdIndex < generatedCandidateIds.length) {
      return generatedCandidateIds[candidateIdIndex++];
    }
    return undefined;
  };

  // Candidate: Maintenance overdue
  if (normalizedRecord.maintenanceStatus === ExternalFleetMaintenanceStatus.OVERDUE) {
    const candidateId = getNextCandidateId();
    if (candidateId) {
      candidates.push({
        candidateId,
        evaluationInputId: evaluationInput.evaluationInputId,
        connectorId,
        tenantId,
        fleetId,
        vehicleId: undefined,
        source: FleetServiceRoutingSource.CONNECTOR_INTAKE,
        reasonCode: FleetServiceRoutingReasonCode.MAINTENANCE_OVERDUE,
        priority: FleetServiceRoutingPriority.HIGH,
        targetServiceType: FleetServiceTargetType.AUTHORIZED_SERVICE,
        status: FleetIntakeServiceCandidateStatus.CANDIDATE,
        createdAt,
      });
    }
  }

  // Candidate: Service is open
  if (normalizedRecord.maintenanceStatus === ExternalFleetMaintenanceStatus.SERVICE_OPEN) {
    const candidateId = getNextCandidateId();
    if (candidateId) {
      candidates.push({
        candidateId,
        evaluationInputId: evaluationInput.evaluationInputId,
        connectorId,
        tenantId,
        fleetId,
        vehicleId: undefined,
        source: FleetServiceRoutingSource.CONNECTOR_INTAKE,
        reasonCode: FleetServiceRoutingReasonCode.SERVICE_STATUS_OPEN,
        priority: FleetServiceRoutingPriority.HIGH,
        targetServiceType: FleetServiceTargetType.AUTHORIZED_SERVICE,
        status: FleetIntakeServiceCandidateStatus.CANDIDATE,
        createdAt,
      });
    }
  }

  // Candidate: Data quality risk (incomplete context)
  if (
    findings.some(
      (f) => f.code === FleetIntakeDataQualityCode.INCOMPLETE_OPERATIONAL_CONTEXT
    )
  ) {
    const candidateId = getNextCandidateId();
    if (candidateId) {
      candidates.push({
        candidateId,
        evaluationInputId: evaluationInput.evaluationInputId,
        connectorId,
        tenantId,
        fleetId,
        vehicleId: undefined,
        source: FleetServiceRoutingSource.CONNECTOR_INTAKE,
        reasonCode: FleetServiceRoutingReasonCode.DATA_QUALITY_REVIEW,
        priority: FleetServiceRoutingPriority.NORMAL,
        targetServiceType: FleetServiceTargetType.INTERNAL_REVIEW,
        status: FleetIntakeServiceCandidateStatus.CANDIDATE,
        createdAt,
      });
    }
  }

  // ============================================
  // PHASE 4: Evaluation Status and Eligibility
  // ============================================

  // Determine evaluation status
  let evaluationStatus: FleetIntakeEvaluationStatus;
  if (readinessType === FleetIntakeReadinessSignalType.QUARANTINE) {
    evaluationStatus = FleetIntakeEvaluationStatus.QUARANTINED;
  } else if (hasCriticalFindings) {
    evaluationStatus = FleetIntakeEvaluationStatus.REJECTED;
  } else if (
    findings.some(
      (f) =>
        f.severity === FleetIntakeDataQualitySeverity.WARNING ||
        f.severity === FleetIntakeDataQualitySeverity.ERROR
    )
  ) {
    evaluationStatus = FleetIntakeEvaluationStatus.ACCEPTED_WITH_WARNINGS;
  } else {
    evaluationStatus = FleetIntakeEvaluationStatus.ACCEPTED;
  }

  // Determine outcome eligibility
  let outcomeEligibility: FleetIntakeOutcomeEligibility;
  if (
    evaluationStatus === FleetIntakeEvaluationStatus.REJECTED ||
    evaluationStatus === FleetIntakeEvaluationStatus.QUARANTINED
  ) {
    outcomeEligibility = FleetIntakeOutcomeEligibility.NOT_ELIGIBLE;
  } else if (evaluationStatus === FleetIntakeEvaluationStatus.ACCEPTED_WITH_WARNINGS) {
    outcomeEligibility = FleetIntakeOutcomeEligibility.REQUIRES_REVIEW;
  } else {
    outcomeEligibility = FleetIntakeOutcomeEligibility.ELIGIBLE;
  }

  // ============================================
  // PHASE 5: Return aggregated result
  // ============================================

  return {
    evaluationResultId,
    evaluationInputId: evaluationInput.evaluationInputId,
    connectorId,
    tenantId,
    fleetId,
    status: evaluationStatus,
    outcomeEligibility,
    dataQualityFindings: findings,
    readinessSignals: signals,
    serviceRoutingCandidates: candidates,
    createdAt,
  };
}
