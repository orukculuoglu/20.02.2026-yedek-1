import { DataEngineGraphInput } from '../data-engine-graph-input';
import { EventNode } from '../../domain/nodes/event-node';
import { GraphNodeType } from '../../domain/enums/graph-node-type';

export function assembleEventNodes(
  input: DataEngineGraphInput
): EventNode[] {
  if (!input.timelineEntries) {
    return [];
  }

  return input.timelineEntries.map((entry) => ({
    id: `event:${entry.entryId}`,
    nodeType: GraphNodeType.EVENT,
    vehicleId: input.vehicleId,
    eventType: entry.entryType,
    timestamp: entry.timestamp,
    eventStatus: entry.status,
    severity: entry.severity,
    createdAt: entry.timestamp,
    context: entry.payload,
  }));
}
