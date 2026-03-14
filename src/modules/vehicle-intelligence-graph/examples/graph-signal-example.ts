import { GraphSignal } from '../domain/signal/graph-signal';
import { GraphSignalType } from '../domain/signal/graph-signal-type';

/**
 * MAINTENANCE_RISK_SIGNAL - Detects recurring maintenance patterns
 */
export const validMaintenanceRiskSignal: GraphSignal = {
  signalId: 'signal:index:maintenance:vehicle:12345:001',
  signalType: GraphSignalType.MAINTENANCE_RISK_SIGNAL,
  vehicleId: 'vehicle:12345',
  sourceNodeIds: [
    'node:vehicle:12345:root',
    'node:event:service:001',
    'node:event:service:002',
    'node:event:service:003',
    'node:intelligence:maintenance:trend:001',
  ],
  sourceEdgeIds: [
    'edge:root:HAS_EVENT:service:001',
    'edge:root:HAS_EVENT:service:002',
    'edge:service:001:HAS_INTELLIGENCE:maintenance:trend:001',
  ],

  severity: 'high',
  confidence: 0.88,
  generatedAt: '2026-03-14T11:30:00Z',
  explanation: 'Signal derived from 3 event(s), 0 source(s), and 1 intelligence node(s). Vehicle shows high maintenance risk with recurring service patterns detected.',

  relatedNodes: ['node:intelligence:maintenance:trend:001'],
  relatedEdges: [
    'edge:root:HAS_EVENT:service:001',
    'edge:root:HAS_EVENT:service:002',
    'edge:service:001:HAS_INTELLIGENCE:maintenance:trend:001',
  ],

  sourceIndexId: 'index:query:maintenance:vehicle:12345:001',
  context: {
    eventCount: 3,
    intelligenceCount: 1,
    edgeCount: 3,
    riskLevel: 'HIGH',
    componentAffected: 'ENGINE',
  },
  metadata: {
    signalSource: 'graph_analysis',
    derivedFrom: 'temporal_pattern_analysis',
  },
};

/**
 * ANOMALY_DETECTION_SIGNAL - Detects unusual behavior patterns
 */
export const validAnomalyDetectionSignal: GraphSignal = {
  signalId: 'signal:index:anomaly:vehicle:12345:002',
  signalType: GraphSignalType.ANOMALY_DETECTION_SIGNAL,
  vehicleId: 'vehicle:12345',
  sourceNodeIds: [
    'node:event:fault:p0101:001',
    'node:event:fault:p0102:001',
    'node:source:obd2:device:001',
    'node:intelligence:anomaly:pattern:001',
  ],
  sourceEdgeIds: [
    'edge:root:HAS_EVENT:fault:p0101:001',
    'edge:source:obd2:HAS_INTELLIGENCE:anomaly:001',
  ],

  severity: 'critical',
  confidence: 0.92,
  generatedAt: '2026-03-14T12:15:00Z',
  explanation: 'Signal derived from 2 event(s), 1 source(s), and 1 intelligence node(s). Anomalous behavior detected in vehicle diagnostic data with critical severity.',

  relatedNodes: ['node:intelligence:anomaly:pattern:001'],
  relatedEdges: [
    'edge:root:HAS_EVENT:fault:p0101:001',
    'edge:source:obd2:HAS_INTELLIGENCE:anomaly:001',
  ],

  sourceIndexId: 'index:query:anomaly:vehicle:12345:002',
  context: {
    eventCount: 2,
    intelligenceCount: 1,
    edgeCount: 2,
    faultCodes: ['P0101', 'P0102'],
    detectionMethod: 'statistical_outlier_analysis',
  },
  metadata: {
    signalSource: 'graph_analysis',
    derivedFrom: 'fault_code_clustering',
  },
};

/**
 * COMPONENT_HEALTH_SIGNAL - Tracks component degradation
 */
export const validComponentHealthSignal: GraphSignal = {
  signalId: 'signal:index:component:vehicle:12345:003',
  signalType: GraphSignalType.COMPONENT_HEALTH_SIGNAL,
  vehicleId: 'vehicle:12345',
  sourceNodeIds: [
    'node:intelligence:component:weakness:001',
    'node:intelligence:component:degradation:001',
  ],
  sourceEdgeIds: ['edge:source:diagnostic:HAS_INTELLIGENCE:component:001'],

  severity: 'medium',
  confidence: 0.78,
  generatedAt: '2026-03-14T13:00:00Z',
  explanation: 'Signal derived from 0 event(s), 0 source(s), and 2 intelligence node(s). Component health indicators show medium degradation patterns.',

  relatedNodes: [
    'node:intelligence:component:weakness:001',
    'node:intelligence:component:degradation:001',
  ],
  relatedEdges: ['edge:source:diagnostic:HAS_INTELLIGENCE:component:001'],

  sourceIndexId: 'index:query:component:vehicle:12345:003',
  context: {
    eventCount: 0,
    intelligenceCount: 2,
    edgeCount: 1,
    affectedComponents: ['transmission', 'suspension'],
    healthScore: 0.65,
  },
  metadata: {
    signalSource: 'graph_analysis',
    derivedFrom: 'component_wear_analysis',
  },
};

/**
 * Invalid signal - missing required fields
 */
export const invalidGraphSignal: GraphSignal = {
  signalId: '',
  signalType: GraphSignalType.SERVICE_DEPENDENCY_SIGNAL,
  vehicleId: '',
  severity: 'low',
  confidence: 0.0,
  generatedAt: '2026-03-14T11:35:00Z',
  explanation: '',
};
