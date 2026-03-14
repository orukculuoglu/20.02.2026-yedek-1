import { GraphSignalType } from './graph-signal-type';

export interface GraphSignal {
  signalId: string;
  signalType: GraphSignalType;
  vehicleId: string;
  sourceNodeIds?: string[];
  sourceEdgeIds?: string[];
  
  // Signal characteristics
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0.0 to 1.0
  generatedAt: string;
  
  // Signal explanation and traceability
  explanation: string;
  relatedNodes?: string[];
  relatedEdges?: string[];
  
  sourceIndexId?: string;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
