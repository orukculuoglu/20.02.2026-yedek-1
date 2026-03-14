import { GraphSignal } from './graph-signal';
import { GraphSignalType } from './graph-signal-type';
import { GraphIndex } from '../index/graph-index';

export function toGraphSignal(
  index: GraphIndex,
  signalType: GraphSignalType
): GraphSignal {
  return {
    signalId: `signal:${index.indexId}:${signalType}`,
    signalType: signalType,
    vehicleId: index.vehicleId,
    sourceNodeIds: index.nodeIds,
    generatedAt: new Date(0).toISOString(),
    sourceIndexId: index.indexId,
    context: index.context,
    metadata: index.metadata,
  };
}
