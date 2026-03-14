import { VehicleGraphSchema } from '../../domain/schemas/vehicle-graph-schema';
import { GraphQuery } from '../../domain/query/graph-query';
import { GraphQueryResult } from '../../domain/query/graph-query-result';

interface TraversalState {
  nodeId: string;
  depth: number;
  path: string[];
}

interface MatchingContext {
  matchedNodeIds: Set<string>;
  matchedEdgeIds: Set<string>;
  traversedPaths: string[][];
}

function isTemporallyValid(
  timestamp: string | undefined,
  timeRange: { from?: string; to?: string } | undefined
): boolean {
  if (!timeRange) return true;
  if (!timestamp) return true;

  if (timeRange.from && timestamp < timeRange.from) {
    return false;
  }
  if (timeRange.to && timestamp > timeRange.to) {
    return false;
  }

  return true;
}

function edgeMatchesFilters(
  edge: any,
  relationFilter: string[] | undefined,
  timeRange: { from?: string; to?: string } | undefined
): boolean {
  if (relationFilter && relationFilter.length > 0) {
    if (!relationFilter.includes(edge.edgeType)) {
      return false;
    }
  }

  if (!isTemporallyValid(edge.createdAt, timeRange)) {
    return false;
  }

  return true;
}

function getNodeById(graph: VehicleGraphSchema, nodeId: string): any {
  if (graph.root.id === nodeId) return graph.root;
  const event = graph.events.find((n) => n.id === nodeId);
  if (event) return event;
  const source = graph.sources.find((n) => n.id === nodeId);
  if (source) return source;
  const intel = graph.intelligence.find((n) => n.id === nodeId);
  if (intel) return intel;
  return undefined;
}

function getOutgoingEdges(graph: VehicleGraphSchema, nodeId: string): any[] {
  return graph.edges.filter((edge) => edge.fromNodeId === nodeId);
}

export function executeGraphQuery(
  graph: VehicleGraphSchema,
  query: GraphQuery
): GraphQueryResult {
  const context: MatchingContext = {
    matchedNodeIds: new Set<string>(),
    matchedEdgeIds: new Set<string>(),
    traversedPaths: [],
  };

  const maxDepth = query.maxDepth ?? 3;
  const startNodeId = query.startNodeId ?? graph.root.id;
  const visited = new Set<string>();
  const queue: TraversalState[] = [{ nodeId: startNodeId, depth: 0, path: [startNodeId] }];

  // BFS Traversal
  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current.nodeId)) {
      continue;
    }

    visited.add(current.nodeId);
    context.matchedNodeIds.add(current.nodeId);
    context.traversedPaths.push([...current.path]);

    // Stop expanding if max depth reached
    if (current.depth >= maxDepth) {
      continue;
    }

    // Get outgoing edges from current node
    const outgoingEdges = getOutgoingEdges(graph, current.nodeId);

    for (const edge of outgoingEdges) {
      // Apply edge filters
      if (!edgeMatchesFilters(edge, query.relationFilter, query.timeRange)) {
        continue;
      }

      context.matchedEdgeIds.add(edge.id);

      // Queue target node if not visited
      if (!visited.has(edge.toNodeId)) {
        const nextState: TraversalState = {
          nodeId: edge.toNodeId,
          depth: current.depth + 1,
          path: [...current.path, edge.toNodeId],
        };
        queue.push(nextState);
      }
    }
  }

  const matchedNodeIds = Array.from(context.matchedNodeIds).sort();
  const matchedEdgeIds = Array.from(context.matchedEdgeIds).sort();
  const resultCount = matchedNodeIds.length + matchedEdgeIds.length;

  return {
    queryId: query.queryId,
    queryType: query.queryType,
    vehicleId: graph.root.vehicleId,
    matchedNodeIds,
    matchedEdgeIds,
    traversedPaths: context.traversedPaths.length > 0 ? context.traversedPaths : undefined,
    resultCount,
    context: query.context,
    metadata: query.metadata,
  };
}
