import { GraphIndexType } from './graph-index-type';

export interface GraphIndex {
  indexId: string;
  indexType: GraphIndexType;
  vehicleId: string;
  nodeIds?: string[];
  edgeIds?: string[];
  timeRange?: {
    from?: string;
    to?: string;
  };
  sourceQueryId?: string;
  createdAt: string;

  // Index summary fields
  vehicleCount?: number;
  eventCount?: number;
  sourceCount?: number;
  intelligenceCount?: number;
  edgeCount?: number;

  // Temporal summary
  temporalSpan?: {
    earliest?: string;
    latest?: string;
  };

  // Trust and provenance summaries
  trustSummary?: Record<string, unknown>;
  provenanceSummary?: Record<string, unknown>;

  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
