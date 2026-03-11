/**
 * Data Engine Phase 1 - Example Feed Objects
 *
 * Realistic intelligence feed examples demonstrating Phase 1 data structures.
 * Shows source-specific feed payloads as they enter the Data Engine Core,
 * and canonical entities created from ingested feeds.
 *
 * Each example illustrates:
 * - Identity-based vehicle linking (identityId)
 * - Multi-source intelligence diversity
 * - Timestamp semantics for causality tracking
 * - Metadata for traceability and normalization readiness
 *
 * NOTE: These examples use FICTIONAL but REALISTIC data structures.
 * Actual payload fields depend on source system contracts.
 */

import type { DataEngineFeedEnvelope } from '../models/DataEngineFeedEnvelope';
import type { DataEngineEntity } from '../models/DataEngineEntity';

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE 1: SERVICE CENTER MAINTENANCE FEED
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Example: Authorized service center repair work feed.
 *
 * A service center notifies the Data Engine that a vehicle
 * underwent scheduled maintenance with parts replacement.
 *
 * Represents: A maintenance event from shop management system
 * Source Type: SERVICE
 * Payload Contains: Work order data, repair codes, parts, labor hours
 */
export const exampleServiceMaintenanceFeed: DataEngineFeedEnvelope = {
  feedId: 'feed_svc_20260311_001a8f9e',
  identityId: 'anon_a7f9e2c3d8b1f4a6c9e2d5f8a1b4c7e0', // Primary linkage
  sourceType: 'SERVICE',

  feedPayload: {
    workOrderId: 'WO-2026-087453',
    workOrderStatus: 'COMPLETED',
    serviceDate: '2026-03-10',
    serviceType: 'SCHEDULED_MAINTENANCE',
    repairCodes: ['91K000', '91K001'], // Standardized service codes
    partsInstalled: [
      {
        partNumber: 'OEM-FILTER-AIR-001',
        partName: 'Engine Air Filter',
        quantity: 1,
        unitCost: 45.00,
      },
      {
        partNumber: 'OEM-SPARK-PLUG-SET',
        partName: 'Spark Plug Set (4)',
        quantity: 1,
        unitCost: 32.00,
      },
    ],
    laborHours: 1.5,
    totalCost: 185.50,
    technician: 'TECH_ID_042', // Internal tech reference, not name
    notes: 'Routine maintenance. Filter was at 40% capacity. All systems normal.',
    nextServiceDue: '2026-06-10',
    odometer: 47250,
  },

  feedMetadata: {
    sourceId: 'SERVICE_CENTER_METRO_42',
    sourceInstanceName: 'Metro Auto Service Center',
    schemaVersion: '2.1.0',
    conformanceLevel: 'STRICT',
    regionCode: 'US',
    issuerContext: {
      issuerId: 'PARTNER_SERVICE_001',
      realm: 'authorized-dealers',
    },
    feedType: 'maintenance',
  },

  feedTimestamps: {
    eventTimestamp: '2026-03-10T14:30:00Z', // When work completed
    observedTimestamp: '2026-03-10T15:45:00Z', // When logged in shop system
    ingestedTimestamp: '2026-03-10T16:02:00Z', // When Data Engine received it
    processedTimestamp: undefined, // Set after Phase 1 preparation
  },

  feedClassification: 'routine_maintenance',
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE 2: INSURANCE CLAIM INCIDENT FEED
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Example: Insurance company incident/claim notification.
 *
 * An insurance partner notifies the Data Engine of a vehicle involved
 * in a claim event with damage assessment.
 *
 * Represents: An insurance claim from claims management system
 * Source Type: INSURANCE
 * Payload Contains: Claim ID, damage type, estimate, policy context
 */
export const exampleInsuranceClaimFeed: DataEngineFeedEnvelope = {
  feedId: 'feed_ins_20260311_002c4f2d',
  identityId: 'anon_a7f9e2c3d8b1f4a6c9e2d5f8a1b4c7e0', // Same vehicle
  sourceType: 'INSURANCE',

  feedPayload: {
    claimId: 'CLM-2026-004521',
    claimDate: '2026-03-09',
    claimType: 'COLLISION',
    damageDescription: 'Front-end collision, moderate damage',
    damageLocations: ['FRONT_BUMPER', 'HOOD', 'FENDER_LEFT'],
    estimatedRepairCost: 3250.00,
    assessmentStatus: 'APPROVED',
    deductible: 500.00,
    policyNumber: 'POL_INTERNAL_ID_789',
    assessorId: 'ASSESSOR_ID_156',
    repairShopAuthorized: 'SHOP_NETWORK_ID_33',
    incidentDate: '2026-03-08',
    injuriesReported: false,
  },

  feedMetadata: {
    sourceId: 'INSURANCE_PARTNER_AAA',
    sourceInstanceName: 'AAA Insurance Claims System',
    schemaVersion: '1.5.0',
    conformanceLevel: 'STRICT',
    regionCode: 'US',
    issuerContext: {
      issuerId: 'PARTNER_INSURANCE_005',
      realm: 'claims-management',
    },
    feedType: 'incident',
  },

  feedTimestamps: {
    eventTimestamp: '2026-03-08T18:15:00Z', // When incident occurred
    observedTimestamp: '2026-03-08T19:00:00Z', // When claim filed
    ingestedTimestamp: '2026-03-09T06:30:00Z', // When Data Engine received it
  },

  feedClassification: 'critical_damage',
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE 3: TELEMATICS DIAGNOSTIC FEED
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Example: Vehicle telematics / OBD diagnostic feed.
 *
 * A telematics provider sends diagnostic readings collected from
 * on-board systems, revealing potential issues.
 *
 * Represents: Diagnostic snapshot from telematics API
 * Source Type: TELEMATICS
 * Payload Contains: OBD fault codes, sensor readings, system health
 */
export const exampleTelematicsDiagnosticFeed: DataEngineFeedEnvelope = {
  feedId: 'feed_tel_20260311_003d5e8a',
  identityId: 'anon_a7f9e2c3d8b1f4a6c9e2d5f8a1b4c7e0', // Same vehicle
  sourceType: 'TELEMATICS',

  feedPayload: {
    telemetrySessionId: 'SESSION_2026_03_11_142500',
    vehicleDataTimestamp: '2026-03-11T14:25:00Z',
    diagnosticFaults: [
      {
        code: 'P0171',
        description: 'System too lean',
        severity: 'WARNING',
        occurrences: 3,
      },
      {
        code: 'P0300',
        description: 'Random/multiple cylinder misfire',
        severity: 'WARNING',
        occurrences: 1,
      },
    ],
    sensorReadings: {
      engineTemperature: 185,
      coolantLevel: 92,
      oilPressure: 45,
      fuelLevel: 65,
      batteryVoltage: 13.8,
    },
    systemHealth: {
      engine: 'CAUTION',
      transmission: 'GOOD',
      brakes: 'GOOD',
      electricalSystems: 'GOOD',
    },
    odometer: 47385,
    fuelEfficiency: 18.3,
    drivingStyle: 'NORMAL',
  },

  feedMetadata: {
    sourceId: 'TELEMATICS_PROVIDER_XYZ',
    sourceInstanceName: 'XYZ Connected Vehicles Platform',
    schemaVersion: '3.0.2',
    conformanceLevel: 'FLEXIBLE', // Telematics may have optional fields
    regionCode: 'US',
    issuerContext: {
      issuerId: 'PARTNER_TELEMATICS_002',
      realm: 'vehicle-diagnostics',
    },
    feedType: 'diagnostic',
  },

  feedTimestamps: {
    eventTimestamp: '2026-03-11T14:25:00Z', // When data collected from vehicle
    observedTimestamp: '2026-03-11T14:28:00Z', // When telematics processed it
    ingestedTimestamp: '2026-03-11T14:35:00Z', // When Data Engine received it
  },

  feedClassification: 'diagnostic_alert',
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE 4: DATA ENGINE ENTITY (CANONICAL INTERNAL REPRESENTATION)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Example: DataEngineEntity created from an ingested feed.
 *
 * After a feed is ingested, the Data Engine wraps it in an Entity structure.
 * The normalizedAttributes may be raw (pre-normalization) or normalized.
 *
 * This entity represents the same maintenance feed as Example 1,
 * but structured as a canonical internal entity.
 *
 * entityId: Deterministically derived from identityId + entityType + normalizedAttributes signature
 *
 * NOTE: This is the internal canonical form, not the transport envelope.
 * Transport payload is preserved in the original FeedEnvelope.
 */
export const exampleMaintenanceEntity: DataEngineEntity = {
  entityId: 'entity_svc_20260311_001f4b7e',
  identityId: 'anon_a7f9e2c3d8b1f4a6c9e2d5f8a1b4c7e0',
  entityType: 'MAINTENANCE_EVENT',
  canonicalCategory: undefined,

  normalizedAttributes: {
    // Normalized attributes structure
    // In Phase 1, attributes are typically from raw feed
    // Normalization happens in Phase 2+
    workOrderId: 'WO-2026-087453',
    workOrderStatus: 'COMPLETED',
    serviceDate: '2026-03-10',
    serviceType: 'SCHEDULED_MAINTENANCE',
    repairCodes: ['91K000', '91K001'],
    partsInstalled: [
      {
        partNumber: 'OEM-FILTER-AIR-001',
        partName: 'Engine Air Filter',
        quantity: 1,
        unitCost: 45.00,
      },
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
    issuerContext: {
      issuerId: 'PARTNER_SERVICE_001',
      realm: 'authorized-dealers',
    },
    feedType: 'maintenance',
  },

  timestamps: {
    eventTimestamp: '2026-03-10T14:30:00Z',
    observedTimestamp: '2026-03-10T15:45:00Z',
    ingestedTimestamp: '2026-03-10T16:02:00Z',
    processedTimestamp: '2026-03-10T16:05:30Z', // Set after Phase 1 processing
  },

  lifecycleState: undefined,
};
