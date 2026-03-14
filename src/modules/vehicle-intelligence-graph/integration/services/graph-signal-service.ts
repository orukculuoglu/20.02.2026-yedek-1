import { GraphIndex } from '../../domain/index/graph-index';
import { GraphSignal } from '../../domain/signal/graph-signal';
import { GraphSignalType } from '../../domain/signal/graph-signal-type';
import { VehicleGraphSchema } from '../../domain/schemas/vehicle-graph-schema';

/**
 * Severity levels based on event frequency and recency
 */
function calculateSeverityFromEventPatterns(
  events: Array<{ timestamp?: string; eventType?: string }>,
  matchedNodeIds: string[]
): 'critical' | 'high' | 'medium' | 'low' {
  const now = new Date();
  const matchedCount = events.length;
  
  if (matchedCount === 0) return 'low';

  // Check recency - events in last 7 days
  const recentCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentEvents = events.filter(e => e.timestamp && new Date(e.timestamp) > recentCutoff);
  
  // Check clustering - events within 24 hours
  const clustered = recentEvents.length >= 3;
  
  // Severity logic
  if (matchedCount >= 5 && recentEvents.length >= 3 && clustered) {
    return 'critical';
  }
  if (matchedCount >= 3 && recentEvents.length >= 2) {
    return 'high';
  }
  if (matchedCount >= 2 || recentEvents.length >= 2) {
    return 'medium';
  }
  return 'low';
}

/**
 * Calculate confidence based on trace quality (trust/provenance)
 */
function calculateConfidence(
  trustSummary?: Record<string, unknown>,
  provenanceSummary?: Record<string, unknown>,
  matchedEdgeCount: number = 0
): number {
  let confidence = 0.5; // Base confidence

  // Boost based on event count (from trust summary)
  if (trustSummary && typeof trustSummary.nodeCount === 'number') {
    const nodeBoost = Math.min(0.2, (trustSummary.nodeCount / 10) * 0.2);
    confidence += nodeBoost;
  }

  // Boost based on provenance diversity (source + event + intelligence variety)
  if (provenanceSummary) {
    const sourceCount = (provenanceSummary.sourceCount as number) || 0;
    const eventCount = (provenanceSummary.eventCount as number) || 0;
    const intelligenceCount = (provenanceSummary.intelligenceCount as number) || 0;
    
    const sourceVariety = sourceCount > 0 ? 1 : 0;
    const eventVariety = eventCount > 0 ? 1 : 0;
    const intelligenceVariety = intelligenceCount > 0 ? 1 : 0;
    
    const diversityBoost = (sourceVariety + eventVariety + intelligenceVariety) * 0.1;
    confidence += diversityBoost;
  }

  // Boost based on edge connectivity
  if (matchedEdgeCount >= 3) {
    confidence += 0.1;
  }

  return Math.min(1.0, Math.max(0.1, confidence));
}

/**
 * Derive signal type based on graph structure and intelligence nodes
 */
function deriveSignalType(
  graph: VehicleGraphSchema,
  matchedNodeIds: string[],
  index: GraphIndex
): GraphSignalType {
  const matchedIntelligence = graph.intelligence.filter(i => matchedNodeIds.includes(i.id));
  const matchedEvents = graph.events.filter(e => matchedNodeIds.includes(e.id));
  
  // Check intelligence types to determine signal
  for (const intel of matchedIntelligence) {
    if (intel.intelligenceType?.includes('maintenance')) {
      return GraphSignalType.MAINTENANCE_RISK_SIGNAL;
    }
    if (intel.intelligenceType?.includes('anomaly')) {
      return GraphSignalType.ANOMALY_DETECTION_SIGNAL;
    }
    if (intel.intelligenceType?.includes('component')) {
      return GraphSignalType.COMPONENT_HEALTH_SIGNAL;
    }
    if (intel.intelligenceType?.includes('dependency') || intel.intelligenceType?.includes('service')) {
      return GraphSignalType.SERVICE_DEPENDENCY_SIGNAL;
    }
  }

  // Check event patterns for maintenance risk
  const maintenanceEvents = matchedEvents.filter(e => 
    e.eventType?.includes('maintenance') || 
    e.eventType?.includes('service') || 
    e.eventType?.includes('repair')
  );
  if (maintenanceEvents.length >= 2) {
    return GraphSignalType.MAINTENANCE_RISK_SIGNAL;
  }

  // Check for anomalies (fault codes, alerts)
  const anomalyEvents = matchedEvents.filter(e => 
    e.eventType?.includes('fault') || 
    e.eventType?.includes('alert') || 
    e.eventType?.includes('warning')
  );
  if (anomalyEvents.length >= 1) {
    return GraphSignalType.ANOMALY_DETECTION_SIGNAL;
  }

  // Default to maintenance risk
  return GraphSignalType.MAINTENANCE_RISK_SIGNAL;
}

/**
 * Generate explanation text based on graph analysis
 */
function generateExplanation(
  signalType: GraphSignalType,
  graph: VehicleGraphSchema,
  matchedNodeIds: string[],
  severity: string
): string {
  const eventCount = graph.events.filter(e => matchedNodeIds.includes(e.id)).length;
  const sourceCount = graph.sources.filter(s => matchedNodeIds.includes(s.id)).length;
  const intelligenceCount = graph.intelligence.filter(i => matchedNodeIds.includes(i.id)).length;

  const baseText = `Signal derived from ${eventCount} event(s), ${sourceCount} source(s), and ${intelligenceCount} intelligence node(s)`;

  switch (signalType) {
    case GraphSignalType.MAINTENANCE_RISK_SIGNAL:
      return `${baseText}. Vehicle shows ${severity} maintenance risk with recurring service patterns detected.`;
    case GraphSignalType.ANOMALY_DETECTION_SIGNAL:
      return `${baseText}. Anomalous behavior detected in vehicle diagnostic data with ${severity} severity.`;
    case GraphSignalType.COMPONENT_HEALTH_SIGNAL:
      return `${baseText}. Component health indicators show ${severity} degradation patterns.`;
    case GraphSignalType.SERVICE_DEPENDENCY_SIGNAL:
      return `${baseText}. Service dependencies and maintenance sequence violations detected at ${severity} level.`;
    case GraphSignalType.INTELLIGENCE_ALERT_SIGNAL:
      return `${baseText}. Intelligence analysis generated ${severity} priority alert.`;
    case GraphSignalType.TRUST_CONFLICT_SIGNAL:
      return `${baseText}. Trust and provenance conflicts detected at ${severity} level.`;
    default:
      return baseText;
  }
}

export function projectGraphSignal(
  index: GraphIndex,
  graph: VehicleGraphSchema
): GraphSignal {
  const matchedNodeIds = index.nodeIds || [];
  const matchedEdgeIds = index.edgeIds || [];

  // Extract events, sources, intelligence from matched nodes
  const matchedEvents = graph.events.filter(e => matchedNodeIds.includes(e.id));
  const matchedIntelligence = graph.intelligence.filter(i => matchedNodeIds.includes(i.id));

  // Derive signal type
  const signalType = deriveSignalType(graph, matchedNodeIds, index);

  // Calculate severity from event patterns
  const severity = calculateSeverityFromEventPatterns(matchedEvents, matchedNodeIds);

  // Calculate confidence from trust/provenance and connectivity
  const confidence = calculateConfidence(index.trustSummary, index.provenanceSummary, matchedEdgeIds.length);

  // Generate explanation
  const explanation = generateExplanation(signalType, graph, matchedNodeIds, severity);

  // Identify related intelligence nodes for traceability
  const relatedIntelligence = matchedIntelligence.slice(0, 3).map(i => i.id);

  return {
    signalId: `graph-signal:${index.vehicleId}-${index.indexId}`,
    signalType,
    vehicleId: index.vehicleId,
    sourceNodeIds: matchedNodeIds,
    sourceEdgeIds: matchedEdgeIds,
    
    severity,
    confidence,
    generatedAt: new Date().toISOString(),
    
    explanation,
    relatedNodes: relatedIntelligence,
    relatedEdges: matchedEdgeIds,
    
    sourceIndexId: index.indexId,
    context: {
      ...index.context,
      eventCount: matchedEvents.length,
      intelligenceCount: matchedIntelligence.length,
      edgeCount: matchedEdgeIds.length,
    },
    metadata: index.metadata,
  };
}
