import { DataEngineGraphInput } from '../data-engine-graph-input';
import { SourceNode } from '../../domain/nodes/source-node';
import { GraphNodeType } from '../../domain/enums/graph-node-type';

export function assembleSourceNodes(
  input: DataEngineGraphInput
): SourceNode[] {
  if (!input.sourceRecords) {
    return [];
  }

  return input.sourceRecords.map((record) => ({
    id: `source:${record.sourceId}`,
    nodeType: GraphNodeType.SOURCE,
    vehicleId: input.vehicleId,
    sourceType: record.sourceType,
    sourceSystem: record.sourceSystem,
    sourceDomain: record.sourceDomain,
    sourceRecordRef: record.sourceRecordRef,
    ingestedAt: record.ingestedAt,
    createdAt: record.ingestedAt ?? new Date(0).toISOString(),
    context: record.payload,
  }));
}
