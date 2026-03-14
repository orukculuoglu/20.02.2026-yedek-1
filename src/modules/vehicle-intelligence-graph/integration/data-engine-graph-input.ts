export interface DataEngineGraphInput {
  vehicleId: string;
  identityRef: string;

  vehicleProfile?: {
    profileId?: string;
    profileType?: string;
    summary?: Record<string, unknown>;
  };

  interpretedSignals?: Array<{
    signalId: string;
    signalType: string;
    confidenceScore?: number;
    generatedAt?: string;
    payload?: Record<string, unknown>;
  }>;

  timelineEntries?: Array<{
    entryId: string;
    entryType: string;
    timestamp: string;
    status?: string;
    severity?: string;
    payload?: Record<string, unknown>;
  }>;

  executionCandidates?: Array<{
    candidateId: string;
    candidateType: string;
    createdAt?: string;
    payload?: Record<string, unknown>;
  }>;

  workOrderCandidates?: Array<{
    orderId: string;
    orderType: string;
    createdAt?: string;
    payload?: Record<string, unknown>;
  }>;

  riskScores?: Array<{
    scoreType: string;
    scoreValue: number;
    calculatedAt?: string;
    payload?: Record<string, unknown>;
  }>;

  sourceRecords?: Array<{
    sourceId: string;
    sourceType: string;
    sourceSystem?: string;
    sourceDomain?: string;
    sourceRecordRef?: string;
    ingestedAt?: string;
    payload?: Record<string, unknown>;
  }>;

  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
