/**
 * Vehicle Intelligence Graph - Canonical Example Payload
 *
 * Complete reference example demonstrating the Vehicle Intelligence Graph structure
 * with realistic node and edge relationships.
 *
 * This example shows:
 * - Vehicle root node as graph anchor
 * - Event nodes (inspection and service)
 * - Source node (OEM system)
 * - Intelligence node (derived insight)
 * - Edges connecting all relationships
 */

import type { VehicleGraphSchema } from '../domain/schemas/vehicle-graph-schema';
import { GraphNodeType } from '../domain/enums/graph-node-type';
import { GraphEdgeType } from '../domain/enums/graph-edge-type';

/**
 * Example vehicle intelligence graph
 *
 * Demonstrates a complete graph structure for a vehicle with:
 * - Diagnostic inspection event
 * - Service appointment event
 * - OEM service system source
 * - Maintenance trend intelligence
 * - 7 edges showing relationships
 */
export const vehicleGraphExample: VehicleGraphSchema = {
  root: {
    id: 'vroot-abc123def456',
    nodeType: GraphNodeType.VEHICLE_ROOT,
    vehicleId: 'VID-2024-00001',
    identityRef: 'ANON-VEH-e8f4a2c9',
    createdAt: '2024-01-15T08:30:00Z',
    domain: 'commercial_fleet',
    status: 'active',
    context: {
      make: 'Mercedes-Benz',
      model: 'Sprinter',
      year: 2022,
      mileage: 185420,
    },
    provenance: {
      system: 'vehicle-intelligence-graph',
      initiated_by: 'data_engine_v15',
    },
  },

  events: [
    {
      id: 'evt-inspection-001a',
      nodeType: GraphNodeType.EVENT,
      vehicleId: 'VID-2024-00001',
      createdAt: '2024-03-10T10:15:00Z',
      eventType: 'diagnostic_inspection',
      timestamp: '2024-03-10T09:45:00Z',
      eventStatus: 'closed',
      severity: 'medium',
      relatedEntities: ['evt-service-002b'],
      context: {
        location: 'Service Center A',
        technician_id: 'TECH-042',
        inspection_type: 'preventive_maintenance',
      },
      provenance: {
        source_system: 'oem_service_api',
        source_record_id: 'SVC-INV-2024-001847',
      },
      trust: {
        confidence: 0.95,
        validation_status: 'verified',
      },
    },
    {
      id: 'evt-service-002b',
      nodeType: GraphNodeType.EVENT,
      vehicleId: 'VID-2024-00001',
      createdAt: '2024-03-08T14:22:00Z',
      eventType: 'scheduled_maintenance',
      timestamp: '2024-03-08T13:30:00Z',
      eventStatus: 'completed',
      severity: 'low',
      relatedEntities: ['evt-inspection-001a'],
      context: {
        service_type: 'oil_and_filter_change',
        parts_replaced: ['oil_filter', 'engine_oil_5w40'],
        labor_hours: 1.5,
      },
      provenance: {
        source_system: 'oem_service_api',
        source_record_id: 'SVC-INV-2024-001823',
      },
      trust: {
        confidence: 1.0,
        validation_status: 'verified',
      },
    },
  ],

  sources: [
    {
      id: 'src-oemapi-001',
      nodeType: GraphNodeType.SOURCE,
      vehicleId: 'VID-2024-00001',
      createdAt: '2024-03-10T10:20:00Z',
      sourceType: 'oem_service_system',
      sourceSystem: 'autodata_service_api',
      sourceDomain: 'maintenance',
      sourceRecordRef: 'OEM-FEED-2024-Q1',
      ingestedAt: '2024-03-10T10:18:45Z',
      context: {
        api_version: 'v3.2.1',
        data_freshness_minutes: 2,
        ingestion_method: 'batch_sync',
      },
      provenance: {
        system: 'data_integration_platform',
        feed_id: 'oem_service_events_eu',
      },
      trust: {
        reliabilityScore: 0.98,
      },
    },
  ],

  intelligence: [
    {
      id: 'intl-maintenance-001',
      nodeType: GraphNodeType.INTELLIGENCE,
      vehicleId: 'VID-2024-00001',
      createdAt: '2024-03-10T11:05:00Z',
      intelligenceType: 'maintenance_tendency',
      derivedFrom: ['evt-service-002b', 'evt-inspection-001a', 'src-oemapi-001'],
      generatedAt: '2024-03-10T11:02:30Z',
      confidence: 0.87,
      explanation:
        'Vehicle shows proactive maintenance pattern. Recent oil service followed by diagnostic inspection suggests well-maintained status. Next recommended service window: 2024-06-10.',
      context: {
        analysis_period_days: 90,
        service_events_count: 3,
        anomaly_detected: false,
      },
      provenance: {
        derived_by: 'intelligence_engine_v2',
        analysis_algorithm: 'maintenance_pattern_classifier',
      },
      trust: {
        confidence: 0.87,
        reliability_factors: ['recent_service_evidence', 'verified_data_sources'],
      },
    },
  ],

  edges: [
    {
      id: 'edge-root-event-insp-001',
      edgeType: GraphEdgeType.HAS_EVENT,
      fromNodeId: 'vroot-abc123def456',
      toNodeId: 'evt-inspection-001a',
      vehicleId: 'VID-2024-00001',
      createdAt: '2024-03-10T10:15:00Z',
      context: {
        relationship_type: 'direct_vehicle_event',
      },
      trust: {
        confidence: 1.0,
      },
    },
    {
      id: 'edge-root-event-svc-002',
      edgeType: GraphEdgeType.HAS_EVENT,
      fromNodeId: 'vroot-abc123def456',
      toNodeId: 'evt-service-002b',
      vehicleId: 'VID-2024-00001',
      createdAt: '2024-03-08T14:22:00Z',
      context: {
        relationship_type: 'direct_vehicle_event',
      },
      trust: {
        confidence: 1.0,
      },
    },
    {
      id: 'edge-root-source-003',
      edgeType: GraphEdgeType.HAS_SOURCE,
      fromNodeId: 'vroot-abc123def456',
      toNodeId: 'src-oemapi-001',
      vehicleId: 'VID-2024-00001',
      createdAt: '2024-03-10T10:20:00Z',
      context: {
        relationship_type: 'data_origin',
      },
      trust: {
        confidence: 1.0,
      },
    },
    {
      id: 'edge-root-intelligence-004',
      edgeType: GraphEdgeType.HAS_INTELLIGENCE,
      fromNodeId: 'vroot-abc123def456',
      toNodeId: 'intl-maintenance-001',
      vehicleId: 'VID-2024-00001',
      createdAt: '2024-03-10T11:05:00Z',
      context: {
        relationship_type: 'derived_insight',
      },
      trust: {
        confidence: 0.87,
      },
    },
    {
      id: 'edge-svc-source-005',
      edgeType: GraphEdgeType.GENERATED_BY_SOURCE,
      fromNodeId: 'evt-service-002b',
      toNodeId: 'src-oemapi-001',
      vehicleId: 'VID-2024-00001',
      createdAt: '2024-03-08T14:22:00Z',
      context: {
        relationship_type: 'event_origin',
      },
      trust: {
        confidence: 1.0,
      },
    },
    {
      id: 'edge-svc-insp-precedes-006',
      edgeType: GraphEdgeType.PRECEDES,
      fromNodeId: 'evt-service-002b',
      toNodeId: 'evt-inspection-001a',
      vehicleId: 'VID-2024-00001',
      createdAt: '2024-03-10T10:15:00Z',
      context: {
        relationship_type: 'temporal_sequence',
        days_between: 2,
      },
      trust: {
        confidence: 1.0,
      },
    },
    {
      id: 'edge-insp-derived-into-007',
      edgeType: GraphEdgeType.DERIVED_INTO,
      fromNodeId: 'evt-inspection-001a',
      toNodeId: 'intl-maintenance-001',
      vehicleId: 'VID-2024-00001',
      createdAt: '2024-03-10T11:05:00Z',
      context: {
        relationship_type: 'insight_generation',
      },
      trust: {
        confidence: 0.87,
      },
    },
  ],
};
