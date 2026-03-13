/**
 * Phase 5 Graph Attachment — Example Scenarios
 *
 * Four realistic entity-to-graph attachment cases demonstrating:
 * 1. Maintenance event with parts (EVENT node, 1 actor, 2 assets)
 * 2. Diagnostic observation (OBSERVATION node, 1 actor, 0 assets)
 * 3. Inspection assessment (OBSERVATION node, 1 actor, 0 assets)
 * 4. Damage incident (EVENT node, 1 actor, 3 assets)
 */

import { attachEntityToGraph } from '../engine/attachEntityToGraph';
import type { DataEngineGraphAttachmentCandidate } from '../models/DataEngineGraphAttachmentCandidate';

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 1: MAINTENANCE EVENT (SERVICE CENTER)
// ─────────────────────────────────────────────────────────────────────────────

export const maintenanceEventExample: DataEngineGraphAttachmentCandidate = {
  entity: {
    entityId: 'ent-001-svc-maint',
    entityType: 'MAINTENANCE_EVENT',
    identityId: 'id-vehicle-001-anon',
    sourceSystem: 'SERVICE_CENTER_001',
    normalizedAttributes: {
      sourceType: 'SERVICE_CENTER',
      sourceRole: 'MAINTAINER',
      feedType: 'SERVICE',
      components: ['ENGINE_OIL_CHANGE', 'OIL_FILTER_REPLACEMENT'],
      technician: 'John Smith',
      mileage: 45000,
    },
    metadata: {
      schemaVersion: '2.0',
      normalizedAt: '2026-03-10T14:35:00Z',
      normalizationSource: 'SERVICE_CENTER',
    },
    temporal: {
      eventTimestamp: '2026-03-10T14:30:00Z',
      eventDate: '2026-03-10',
      recordedTimestamp: '2026-03-10T14:35:00Z',
      recordedDate: '2026-03-10',
    },
    quality: {
      completeness: 'HIGH',
      confidence: 'HIGH',
      hasInferredValues: false,
      normalizationWarnings: 0,
    },
  },
  identityBindingRef: {
    identityId: 'id-vehicle-001-anon',
    bindingStatus: 'BOUND',
  },
};

export const maintenanceEventAttached = attachEntityToGraph(maintenanceEventExample);

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 2: DIAGNOSTIC OBSERVATION (TELEMATICS)
// ─────────────────────────────────────────────────────────────────────────────

export const diagnosticObservationExample: DataEngineGraphAttachmentCandidate = {
  entity: {
    entityId: 'ent-002-tel-diag',
    entityType: 'DIAGNOSTIC_EVENT',
    identityId: 'id-vehicle-002-anon',
    sourceSystem: 'TELEMATICS_FLEET_01',
    normalizedAttributes: {
      sourceType: 'TELEMATICS_PROVIDER',
      sourceRole: 'DIAGNOSTIC_SYSTEM',
      feedType: 'TELEMATICS',
      faultCode: 'P0128',
      description: 'Coolant Temperature Regulation',
      severity: 'MEDIUM',
    },
    metadata: {
      schemaVersion: '1.5',
      normalizedAt: '2026-03-11T08:16:00Z',
      normalizationSource: 'TELEMATICS',
    },
    temporal: {
      eventTimestamp: '2026-03-11T08:15:00Z',
      eventDate: '2026-03-11',
      recordedTimestamp: '2026-03-11T08:16:00Z',
      recordedDate: '2026-03-11',
    },
    quality: {
      completeness: 'HIGH',
      confidence: 'MEDIUM',
      hasInferredValues: false,
      normalizationWarnings: 1,
    },
  },
  identityBindingRef: {
    identityId: 'id-vehicle-002-anon',
    bindingStatus: 'BOUND_WITH_LIMITATIONS',
  },
};

export const diagnosticObservationAttached = attachEntityToGraph(diagnosticObservationExample);

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 3: INSPECTION ASSESSMENT (INSURANCE)
// ─────────────────────────────────────────────────────────────────────────────

export const inspectionAssessmentExample: DataEngineGraphAttachmentCandidate = {
  entity: {
    entityId: 'ent-003-ins-insp',
    entityType: 'INSPECTION_RESULT',
    identityId: 'id-vehicle-003-anon',
    sourceSystem: 'INSURE_CORP_CLAIMS',
    normalizedAttributes: {
      sourceType: 'INSURANCE_PROVIDER',
      sourceRole: 'CLAIMS_ADJUSTER',
      feedType: 'INSURANCE',
      claimNumber: 'CLM-2026-001234',
      assessmentType: 'DAMAGE_ASSESSMENT',
      estimatedCost: 5400.00,
    },
    metadata: {
      schemaVersion: '2.1',
      normalizedAt: '2026-03-09T10:15:00Z',
      normalizationSource: 'INSURANCE',
    },
    temporal: {
      eventTimestamp: '2026-03-09T10:00:00Z',
      eventDate: '2026-03-09',
      recordedTimestamp: '2026-03-09T10:15:00Z',
      recordedDate: '2026-03-09',
    },
    quality: {
      completeness: 'MEDIUM',
      confidence: 'HIGH',
      hasInferredValues: false,
      normalizationWarnings: 0,
    },
  },
  identityBindingRef: {
    identityId: 'id-vehicle-003-anon',
    bindingStatus: 'BOUND',
  },
};

export const inspectionAssessmentAttached = attachEntityToGraph(inspectionAssessmentExample);

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 4: DAMAGE INCIDENT (COLLISION)
// ─────────────────────────────────────────────────────────────────────────────

export const damageIncidentExample: DataEngineGraphAttachmentCandidate = {
  entity: {
    entityId: 'ent-004-dmg-coll',
    entityType: 'DAMAGE_EVENT',
    identityId: 'id-vehicle-004-anon',
    sourceSystem: 'COLLISION_REGISTRY_API',
    normalizedAttributes: {
      sourceType: 'COLLISION_AUTHORITY',
      sourceRole: 'DAMAGE_RECORDER',
      feedType: 'SERVICE',
      components: [
        'FRONT_BUMPER_REPLACEMENT',
        'HOOD_REPLACEMENT',
        'RADIATOR_REPLACEMENT',
      ],
      incidentType: 'BILATERAL_COLLISION',
      severity: 'MAJOR',
      repairRequired: true,
    },
    metadata: {
      schemaVersion: '2.0',
      normalizedAt: '2026-03-08T17:30:00Z',
      normalizationSource: 'SERVICE',
    },
    temporal: {
      eventTimestamp: '2026-03-08T16:45:00Z',
      eventDate: '2026-03-08',
      recordedTimestamp: '2026-03-08T17:30:00Z',
      recordedDate: '2026-03-08',
    },
    quality: {
      completeness: 'HIGH',
      confidence: 'HIGH',
      hasInferredValues: false,
      normalizationWarnings: 0,
    },
  },
  identityBindingRef: {
    identityId: 'id-vehicle-004-anon',
    bindingStatus: 'BOUND',
  },
};

export const damageIncidentAttached = attachEntityToGraph(damageIncidentExample);

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE COLLECTION
// ─────────────────────────────────────────────────────────────────────────────

export const exampleGraphAttachmentCases = [
  {
    name: 'Maintenance Event (Service Center)',
    candidate: maintenanceEventExample,
    result: maintenanceEventAttached,
    expectedNodeCount: 4, // vehicle, event, actor, 2x assets
    expectedEdgeCount: 4, // has_event, involves_actor, 2x involves_asset
  },
  {
    name: 'Diagnostic Observation (Telematics)',
    candidate: diagnosticObservationExample,
    result: diagnosticObservationAttached,
    expectedNodeCount: 3, // vehicle, observation, actor
    expectedEdgeCount: 2, // has_observation, involves_actor
  },
  {
    name: 'Inspection Assessment (Insurance)',
    candidate: inspectionAssessmentExample,
    result: inspectionAssessmentAttached,
    expectedNodeCount: 3, // vehicle, observation, actor
    expectedEdgeCount: 2, // has_observation, involves_actor
  },
  {
    name: 'Damage Incident (Collision)',
    candidate: damageIncidentExample,
    result: damageIncidentAttached,
    expectedNodeCount: 6, // vehicle, event, actor, 3x assets
    expectedEdgeCount: 5, // has_event, involves_actor, 3x involves_asset
  },
];
