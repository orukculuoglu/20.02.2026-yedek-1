import { DataEngineGraphInput } from '../data-engine-graph-input';
import { IntelligenceNode } from '../../domain/nodes/intelligence-node';
import { GraphNodeType } from '../../domain/enums/graph-node-type';

export function assembleIntelligenceNodes(
  input: DataEngineGraphInput
): IntelligenceNode[] {
  if (!input.interpretedSignals) {
    return [];
  }

  return input.interpretedSignals.map((signal) => ({
    id: `intelligence:${signal.signalId}`,
    nodeType: GraphNodeType.INTELLIGENCE,
    vehicleId: input.vehicleId,
    intelligenceType: signal.signalType,
    generatedAt: signal.generatedAt ?? new Date(0).toISOString(),
    confidence: signal.confidenceScore,
    explanation: undefined,
    createdAt: signal.generatedAt ?? new Date(0).toISOString(),
    context: signal.payload,
  }));
}
