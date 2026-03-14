import { GraphQueryResult } from '../../domain/query/graph-query-result';
import { GraphIndex } from '../../domain/index/graph-index';
import { GraphIndexType } from '../../domain/index/graph-index-type';
import { VehicleGraphSchema } from '../../domain/schemas/vehicle-graph-schema';

/**
 * Helper function to derive the appropriate index type based on graph structure
 */
function deriveIndexType(graph: VehicleGraphSchema, result: GraphQueryResult): GraphIndexType {
  const nodeCount = result.matchedNodeIds.length;
  const eventCount = graph.events.filter(e => result.matchedNodeIds.includes(e.id)).length;
  const intelligenceCount = graph.intelligence.filter(i => result.matchedNodeIds.includes(i.id)).length;
  const sourceCount = graph.sources.filter(s => result.matchedNodeIds.includes(s.id)).length;
  const hasRoot = result.matchedNodeIds.includes(graph.root.id);

  // Determine index type based on node composition
  if (intelligenceCount > 0 && intelligenceCount >= eventCount && intelligenceCount >= sourceCount) {
    return GraphIndexType.INTELLIGENCE_INDEX;
  }
  if (eventCount > 0 && eventCount >= sourceCount) {
    return GraphIndexType.EVENT_INDEX;
  }
  if (sourceCount > 0) {
    return GraphIndexType.SOURCE_INDEX;
  }
  if (hasRoot) {
    return GraphIndexType.VEHICLE_INDEX;
  }
  return GraphIndexType.NODE_INDEX;
}

/**
 * Helper function to calculate temporal span from events in the graph
 */
function calculateTemporalSpan(graph: VehicleGraphSchema, matchedNodeIds: string[]): { earliest?: string; latest?: string } {
  const matchedEvents = graph.events.filter(e => matchedNodeIds.includes(e.id));
  
  if (matchedEvents.length === 0) {
    return {};
  }

  const timestamps = matchedEvents
    .map(e => e.timestamp)
    .filter((ts): ts is string => !!ts)
    .sort();

  if (timestamps.length === 0) {
    return {};
  }

  return {
    earliest: timestamps[0],
    latest: timestamps[timestamps.length - 1],
  };
}

export function projectGraphIndex(
  result: GraphQueryResult,
  graph: VehicleGraphSchema
): GraphIndex {
  const matchedEvents = graph.events.filter(e => result.matchedNodeIds.includes(e.id));
  const matchedSources = graph.sources.filter(s => result.matchedNodeIds.includes(s.id));
  const matchedIntelligence = graph.intelligence.filter(i => result.matchedNodeIds.includes(i.id));

  return {
    indexId: `graph-index:${result.queryId}`,
    indexType: deriveIndexType(graph, result),
    vehicleId: result.vehicleId,
    sourceQueryId: result.queryId,
    nodeIds: result.matchedNodeIds,
    edgeIds: result.matchedEdgeIds,
    createdAt: new Date().toISOString(),

    // Index summary statistics
    vehicleCount: result.matchedNodeIds.includes(graph.root.id) ? 1 : 0,
    eventCount: matchedEvents.length,
    sourceCount: matchedSources.length,
    intelligenceCount: matchedIntelligence.length,
    edgeCount: result.matchedEdgeIds.length,

    // Temporal summary
    temporalSpan: calculateTemporalSpan(graph, result.matchedNodeIds),

    // Trust and provenance summaries (placeholder for future implementation)
    trustSummary: {
      nodeCount: result.matchedNodeIds.length,
      analyzedAt: new Date().toISOString(),
    },
    provenanceSummary: {
      sourceCount: matchedSources.length,
      eventCount: matchedEvents.length,
      intelligenceCount: matchedIntelligence.length,
    },

    context: result.context,
    metadata: result.metadata,
  };
}
