/**
 * Example Normalization Cases
 *
 * Realistic feed normalization scenarios demonstrating all outcomes:
 * - NORMALIZED: Service maintenance with complete data
 * - NORMALIZED: Insurance claim with good quality
 * - NORMALIZED_WITH_WARNINGS: Telematics with legacy schema
 * - NORMALIZED_WITH_WARNINGS: Incomplete maintenance record
 * - REJECTED: Malformed payload missing required fields
 */

import type { DataEngineNormalizationCandidate } from '../models/DataEngineNormalizationCandidate';

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO 1: Complete Service Maintenance → NORMALIZED
// ─────────────────────────────────────────────────────────────────────────────

export const serviceCenterMaintenanceNormalized: DataEngineNormalizationCandidate = {
  bindingResultRef: 'binding__svc-201-full-trusted',
  identityId: 'identity__service-center-001',
  sourceType: 'SERVICE',
  feedPayload: {
    serviceDate: '2024-01-15',
    serviceFacilityId: 'SVC-201',
    serviceFacilityName: 'Premium Service Center Munich',
    mileage: 85234,
    repairCodes: ['91K000', '91Q000'],
    repairDescriptions: ['Brake pad replacement', 'Tire rotation'],
    partsUsed: ['BP-BRHD-001', 'TP-ROT-002'],
    laborHours: 2.5,
    cost: 450.0,
    currency: 'EUR',
    technician: 'TECH-089',
    workOrderId: 'WO-2024-001584',
  },
  feedMetadata: {
    schemaVersion: '2.1',
    sourceSystem: 'SERVICE',
    classification: 'MAINTENANCE',
  },
  feedTimestamps: {
    intakeAt: '2024-01-16T08:30:00Z',
    bindingEvaluatedAt: '2024-01-16T08:31:15Z',
    normalizationStartsAt: '2024-01-16T08:31:16Z',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO 2: Insurance Claim with Good Data → NORMALIZED
// ─────────────────────────────────────────────────────────────────────────────

export const insuranceClaimNormalized: DataEngineNormalizationCandidate = {
  bindingResultRef: 'binding__insurance-claim-abc123',
  identityId: 'identity__insurance-partner-global',
  sourceType: 'INSURANCE',
  feedPayload: {
    claimId: 'CLM-2024-987654',
    claimType: 'ACCIDENT',
    claimDate: '2024-01-10',
    incidentDate: '2024-01-09T14:30:00Z',
    damageDescription: 'Front end collision, significant bumper and hood damage',
    damageType: 'COLLISION',
    severity: 'MEDIUM',
    estimatedRepairCost: 3500.0,
    repairFacility: 'AUTH-REPAIR-PARTNER-KLN',
    photos: [
      'https://evidence.insurance.com/clm987654/photo1.jpg',
      'https://evidence.insurance.com/clm987654/photo2.jpg',
    ],
    policyholder: {
      policyNumber: 'POL-2023-445566',
      name: 'John Doe',
    },
    vehicle: {
      registrationNumber: 'BC-XYZ-789',
      make: 'BMW',
      model: 'X5',
      year: 2019,
    },
  },
  feedMetadata: {
    schemaVersion: '2.0',
    sourceSystem: 'INSURANCE',
    classification: 'DAMAGE',
  },
  feedTimestamps: {
    intakeAt: '2024-01-10T16:45:00Z',
    bindingEvaluatedAt: '2024-01-10T16:46:30Z',
    normalizationStartsAt: '2024-01-10T16:46:31Z',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO 3: Telematics Diagnostic with Legacy Schema → NORMALIZED_WITH_WARNINGS
// ─────────────────────────────────────────────────────────────────────────────

export const telematicsDiagnosticWithWarnings: DataEngineNormalizationCandidate = {
  bindingResultRef: 'binding__telematics-vehicle-456789',
  identityId: 'identity__telematics-provider-eu',
  sourceType: 'TELEMATICS',
  feedPayload: {
    vehicleId: 'VEH-TELEM-456789',
    timestamp: '2024-01-17T10:15:00Z',
    diagnosticCodes: ['P0101', 'P0130'],
    diagnosticDescriptions: ['Mass Air Flow (MAF) Sensor', 'Oxygen Sensor Circuit'],
    signalData: {
      engineLoad: 45.2,
      fuelTrim: 2.3,
      intakeTemp: 32.0,
      o2Voltage: 0.45,
    },
    systemStatus: 'CHECK_ENGINE_LIGHT_ON',
    fault_occurrence_count: 3,
  },
  feedMetadata: {
    schemaVersion: '1.0',
    sourceSystem: 'TELEMATICS',
    classification: 'DIAGNOSTIC',
  },
  feedTimestamps: {
    intakeAt: '2024-01-17T10:20:00Z',
    bindingEvaluatedAt: '2024-01-17T10:21:00Z',
    normalizationStartsAt: '2024-01-17T10:21:01Z',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO 4: Incomplete Maintenance with Missing Fields → NORMALIZED_WITH_WARNINGS
// ─────────────────────────────────────────────────────────────────────────────

export const incompleteMaintenanceWithWarnings: DataEngineNormalizationCandidate = {
  bindingResultRef: 'binding__incomplete-service-xyz',
  identityId: 'identity__partner-service-secondary',
  sourceType: 'SERVICE',
  feedPayload: {
    serviceDate: '2024-01-14',
    serviceFacilityId: 'SVC-085',
    // Missing repairCodes - should trigger MISSING_REQUIRED_FIELD
    laborHours: 1.0,
    cost: 275.0,
    currency: 'EUR',
    // Missing technician info
    // Missing work order reference
  },
  feedMetadata: {
    schemaVersion: '2.1',
    sourceSystem: 'SERVICE',
    classification: 'MAINTENANCE',
  },
  feedTimestamps: {
    intakeAt: '2024-01-15T09:00:00Z',
    bindingEvaluatedAt: '2024-01-15T09:01:00Z',
    normalizationStartsAt: '2024-01-15T09:01:01Z',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO 5: Malformed Payload → REJECTED
// ─────────────────────────────────────────────────────────────────────────────

export const malformedPayloadRejected: DataEngineNormalizationCandidate = {
  bindingResultRef: 'binding__malformed-data-001',
  identityId: 'identity__unknown-source-partner',
  sourceType: 'SERVICE',
  feedPayload: {
    // Completely wrong structure - missing all required fields
    data: 'This is not a valid service record',
    someRandomField: 12345,
    invalid_structure: true,
  },
  feedMetadata: {
    schemaVersion: '2.1',
    sourceSystem: 'SERVICE',
    classification: 'MAINTENANCE',
  },
  feedTimestamps: {
    intakeAt: '2024-01-18T11:00:00Z',
    bindingEvaluatedAt: '2024-01-18T11:01:00Z',
    normalizationStartsAt: '2024-01-18T11:01:01Z',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO 6: Inspection Record with Good Coverage → NORMALIZED
// ─────────────────────────────────────────────────────────────────────────────

export const inspectionRecordNormalized: DataEngineNormalizationCandidate = {
  bindingResultRef: 'binding__inspection-annual-2024',
  identityId: 'identity__inspection-authority-state',
  sourceType: 'SERVICE',
  feedPayload: {
    serviceDate: '2024-01-12',
    serviceFacilityId: 'INS-STATE-001',
    serviceFacilityName: 'State Inspection Center',
    inspectionType: 'ANNUAL_SAFETY',
    repairCodes: ['PASS'],
    inspectionResult: 'PASS',
    expiryDate: '2025-01-12',
    inspectorId: 'INSP-0042',
    notes: 'Vehicle passed all safety checks with no defects',
  },
  feedMetadata: {
    schemaVersion: '2.1',
    sourceSystem: 'INSPECTION',
    classification: 'INSPECTION',
  },
  feedTimestamps: {
    intakeAt: '2024-01-13T08:00:00Z',
    bindingEvaluatedAt: '2024-01-13T08:01:30Z',
    normalizationStartsAt: '2024-01-13T08:01:31Z',
  },
};

/**
 * All Example Cases Export
 * Maps friendly names to normalization candidates for testing/demonstration
 */
export const exampleNormalizationCases = {
  serviceCenterMaintenanceNormalized,
  insuranceClaimNormalized,
  telematicsDiagnosticWithWarnings,
  incompleteMaintenanceWithWarnings,
  malformedPayloadRejected,
  inspectionRecordNormalized,
};
