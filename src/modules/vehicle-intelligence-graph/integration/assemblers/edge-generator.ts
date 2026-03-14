import { VehicleRootNode } from '../../domain/nodes/vehicle-root-node';
import { EventNode } from '../../domain/nodes/event-node';
import { SourceNode } from '../../domain/nodes/source-node';
import { IntelligenceNode } from '../../domain/nodes/intelligence-node';
import { GraphEdge } from '../../domain/edges/graph-edge';
import { GraphEdgeType } from '../../domain/enums/graph-edge-type';

export function generateGraphEdges(
  root: VehicleRootNode,
  events: EventNode[],
  sources: SourceNode[],
  intelligence: IntelligenceNode[]
): GraphEdge[] {
  const edges: GraphEdge[] = [];

  // Root node -> Event nodes (HAS_EVENT)
  for (const event of events) {
    edges.push({
      id: `edge:${root.id}:${GraphEdgeType.HAS_EVENT}:${event.id}`,
      edgeType: GraphEdgeType.HAS_EVENT,
      fromNodeId: root.id,
      toNodeId: event.id,
      vehicleId: root.vehicleId,
      createdAt: new Date(0).toISOString(),
    });
  }

  // Root node -> Source nodes (HAS_SOURCE)
  for (const source of sources) {
    edges.push({
      id: `edge:${root.id}:${GraphEdgeType.HAS_SOURCE}:${source.id}`,
      edgeType: GraphEdgeType.HAS_SOURCE,
      fromNodeId: root.id,
      toNodeId: source.id,
      vehicleId: root.vehicleId,
      createdAt: new Date(0).toISOString(),
    });
  }

  // Event nodes -> Intelligence nodes (derived_from_event relationship)
  for (const event of events) {
    for (const intel of intelligence) {
      // Only connect if intelligence timestamp is after event timestamp
      if (intel.generatedAt >= event.timestamp) {
        edges.push({
          id: `edge:${event.id}:derived_from:${intel.id}`,
          edgeType: GraphEdgeType.HAS_INTELLIGENCE,
          fromNodeId: event.id,
          toNodeId: intel.id,
          vehicleId: root.vehicleId,
          createdAt: new Date(0).toISOString(),
          context: {
            relationshipType: 'derived_from_event',
          },
        });
      }
    }
  }

  // Source nodes -> Intelligence nodes (derived_from relationship)
  for (const source of sources) {
    for (const intel of intelligence) {
      edges.push({
        id: `edge:${source.id}:derived_to:${intel.id}`,
        edgeType: GraphEdgeType.HAS_INTELLIGENCE,
        fromNodeId: source.id,
        toNodeId: intel.id,
        vehicleId: root.vehicleId,
        createdAt: new Date(0).toISOString(),
        context: {
          relationshipType: 'derived_from_source',
        },
      });
    }
  }

  return edges;
}
