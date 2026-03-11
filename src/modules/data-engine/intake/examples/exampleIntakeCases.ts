/**
 * Example Intake Cases
 *
 * Realistic scenarios demonstrating intake evaluation across different feed types and quality conditions.
 * Shows how the intake layer handles real-world feed variations.
 */

import type { DataEngineFeedCandidate } from '../types/DataEngineFeedCandidate';
import type { DataEngineIntakeResult } from '../models/DataEngineIntakeResult';
import { evaluateFeedIntake } from '../models/evaluateFeedIntake';
import { defaultIntakePolicy } from '../models/DataEngineIntakePolicy';

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 1: MODERN SERVICE CENTER - COMPLETE, CLEAN FEED
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: A modern service center management system submits a complete,
 * well-structured maintenance feed with all required and optional fields.
 *
 * Expected Outcome: ACCEPTED
 * - All critical fields present and valid
 * - Optional metadata complete
 * - Current schema version
 * - Timestamps valid and properly sequenced
 */
export const caseModernServiceClean: DataEngineFeedCandidate = {
  candidateId: 'cand_20260311_srv_clean_001',
  candidateTimestamp: '2026-03-11T16:05:30Z',
  sourceOrigin: 'SERVICE',
  identityId: 'anon_a7f9e2c3d8b1f4a6c9e2d5f8a1b4c7e0',

  candidatePayload: {
    workOrderId: 'WO-2026-087453',
    workOrderStatus: 'COMPLETED',
    serviceDate: '2026-03-10',
    repairCodes: ['91K000', '91K001'],
    partsInstalled: [
      { partNumber: 'OEM-FILTER-AIR-001', quantity: 1, unitCost: 45.0 },
    ],
    laborHours: 1.5,
    totalCost: 185.50,
  },

  metadata: {
    sourceId: 'SERVICE_CENTER_METRO_42',
    sourceInstanceName: 'Metro Auto Service Center',
    schemaVersion: '2.1.0',
    conformanceLevel: 'STRICT',
    regionCode: 'US',
    issuerContext: { issuerId: 'PARTNER_SERVICE_001', realm: 'authorized-dealers' },
    feedType: 'maintenance',
  },

  timestamps: {
    eventTimestamp: '2026-03-10T14:30:00Z',
    observedTimestamp: '2026-03-10T15:45:00Z',
    ingestedTimestamp: '2026-03-10T16:02:00Z',
  },
};

export const caseModernServiceCleanResult: DataEngineIntakeResult = {
  status: 'ACCEPTED',
  issues: [],
  candidateId: 'cand_20260311_srv_clean_001',
  policyApplied: defaultIntakePolicy,
  decisionSummary: 'Feed accepted; all requirements satisfied',
  evaluatedAt: '2026-03-11T16:05:35Z',
};

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 2: FLEET SYSTEM - MISSING OPTIONAL METADATA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: A fleet management platform submits a feed with all critical data
 * but is missing optional region and issuer context metadata.
 *
 * Expected Outcome: ACCEPTED_WITH_WARNINGS
 * - Core fields present and valid
 * - Missing optional metadata (regionCode, issuerContext)
 * - Policy allows missing optional metadata
 * - Feed is operationally valuable despite incomplete context
 */
export const caseFleetMissingOptionalMetadata: DataEngineFeedCandidate = {
  candidateId: 'cand_20260311_fleet_001',
  candidateTimestamp: '2026-03-11T17:10:30Z',
  sourceOrigin: 'FLEET',
  identityId: 'anon_b8g0f3d4e9c2h5i7d6e0f1a4b7c5d8e1',

  candidatePayload: {
    fleetEventId: 'FLT_2026_001234',
    eventType: 'SCHEDULED_MAINTENANCE',
    vehicleOdometer: 52340,
    nextMaintenanceDue: 2660,
    maintenanceCategories: ['OIL_CHANGE', 'TIRE_ROTATION'],
  },

  metadata: {
    sourceId: 'FLEET_OPS_NETWORK_002',
    sourceInstanceName: 'National Fleet Operations Center',
    schemaVersion: '1.8.0',
    conformanceLevel: 'FLEXIBLE',
    // regionCode and issuerContext intentionally omitted
  },

  timestamps: {
    eventTimestamp: '2026-03-11T10:00:00Z',
    observedTimestamp: '2026-03-11T10:15:00Z',
    ingestedTimestamp: '2026-03-11T17:10:00Z',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 3: LEGACY INSURANCE SYSTEM - OLD SCHEMA VERSION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: An older insurance claims system submits a feed using legacy
 * schema version 1.0.0. All core data is present and valid, but schema is old.
 *
 * Expected Outcome: ACCEPTED_WITH_WARNINGS
 * - Core requirements met
 * - Legacy schema version detected (version 1.x)
 * - Policy accepts legacy conformance
 * - Feed proceeds with operational awareness
 */
export const caseLegacyInsuranceOldSchema: DataEngineFeedCandidate = {
  candidateId: 'cand_20260311_ins_legacy_001',
  candidateTimestamp: '2026-03-11T08:30:45Z',
  sourceOrigin: 'INSURANCE',
  identityId: 'anon_c9h1g4e5f0d3i6j8e7f2b5c8d6e9f2a3',

  candidatePayload: {
    claimNumber: 'CLM_LEG_2026_00891',
    claimStatus: 'APPROVED',
    incidentType: 'COLLISION',
    estimatedRepairCost: 2850.0,
    claimDate: '2026-03-09T14:00:00Z',
  },

  metadata: {
    sourceId: 'INSURANCE_LEGACY_SYSTEM_A',
    sourceInstanceName: 'Legacy Claims (Pre-2024)',
    schemaVersion: '1.0.0', // Old version but still operational
    conformanceLevel: 'LEGACY',
    regionCode: 'US',
  },

  timestamps: {
    eventTimestamp: '2026-03-08T16:45:00Z',
    observedTimestamp: '2026-03-08T17:30:00Z',
    ingestedTimestamp: '2026-03-11T08:30:00Z',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 4: TELEMATICS - MALFORMED TIMESTAMP
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: A telematics provider submits a feed where one timestamp is malformed
 * but the rest of the data is valuable. The feed should be quarantined for
 * manual review rather than hard-rejected.
 *
 * Expected Outcome: QUARANTINED
 * - Core fields present
 * - One timestamp is malformed ('2026-03-11T14:25:99Z' - invalid seconds)
 * - Feed is otherwise valuable
 * - Policy quarantines malformed timestamps instead of rejecting
 * - Manual review determines if timestamp can be fixed
 */
export const caseTelematicsMalformedTimestamp: DataEngineFeedCandidate = {
  candidateId: 'cand_20260311_tel_malformed_001',
  candidateTimestamp: '2026-03-11T14:40:00Z',
  sourceOrigin: 'TELEMATICS',
  identityId: 'anon_d0i2h5f6g1e4j7k9f8g3c6d9e7f0a4b5',

  candidatePayload: {
    telemetrySessionId: 'SESSION_2026_03_11_142500',
    diagnosticFaults: [
      { code: 'P0171', severity: 'WARNING', occurrences: 2 },
    ],
    sensorReadings: {
      engineTemp: 185,
      oilPressure: 45,
      batteryVoltage: 13.8,
    },
  },

  metadata: {
    sourceId: 'TELEMATICS_PROVIDER_XYZ',
    schemaVersion: '2.5.1',
    conformanceLevel: 'FLEXIBLE',
  },

  timestamps: {
    eventTimestamp: '2026-03-11T14:25:00Z',
    observedTimestamp: '2026-03-11T14:25:99Z', // MALFORMED: seconds out of range
    ingestedTimestamp: '2026-03-11T14:40:00Z',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 5: MISSING CRITICAL FIELD - NO IDENTITY ID
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: A feed arrives with complete data but no identityId to link
 * the vehicle to the vehicle identity system.
 *
 * Expected Outcome: REJECTED
 * - Blocking issue: missing identityId
 * - Cannot link to known vehicle
 * - Cannot proceed through pipeline
 * - Upstream system must resolve and resubmit
 */
export const caseNoIdentityId: DataEngineFeedCandidate = {
  candidateId: 'cand_20260311_no_id_001',
  candidateTimestamp: '2026-03-11T15:30:00Z',
  sourceOrigin: 'PARTS_NETWORK',
  // identityId intentionally missing
  identityId: undefined,

  candidatePayload: {
    partOrderId: 'PO_2026_451223',
    partNumber: 'OEM-BRAKE-PAD-SET',
    quantity: 2,
    orderDate: '2026-03-10',
  },

  metadata: {
    sourceId: 'PARTS_SUPPLIER_OEM_001',
    schemaVersion: '2.0.0',
  },

  timestamps: {
    eventTimestamp: '2026-03-10T09:00:00Z',
    observedTimestamp: '2026-03-10T09:15:00Z',
    ingestedTimestamp: '2026-03-11T15:30:00Z',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 6: EMPTY PAYLOAD
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: A feed has proper envelope structure but the payload is empty.
 * No intelligence data to ingest.
 *
 * Expected Outcome: REJECTED
 * - Blocking issue: empty payload
 * - No intelligence data
 * - Cannot proceed
 */
export const caseEmptyPayload: DataEngineFeedCandidate = {
  candidateId: 'cand_20260311_empty_001',
  candidateTimestamp: '2026-03-11T16:15:00Z',
  sourceOrigin: 'EXPERT_SYSTEM',
  identityId: 'anon_e1j3i6g7h2f5k8l0g9h4d7e0f8g1b5c6',

  candidatePayload: {}, // EMPTY

  metadata: {
    sourceId: 'EXPERT_DIAGNOSTICS_MAIN',
    schemaVersion: '2.0.0',
  },

  timestamps: {
    eventTimestamp: '2026-03-11T16:00:00Z',
    observedTimestamp: '2026-03-11T16:05:00Z',
    ingestedTimestamp: '2026-03-11T16:15:00Z',
  },
};
