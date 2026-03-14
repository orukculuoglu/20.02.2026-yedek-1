/**
 * Result returned by calculator
 * Transformed by IndexRecordFactory into IndexRecord
 */
export interface IndexCalculationResult {
  score: number;
  band: string;
  confidence: number;
  explanation: string;
  metadata?: Record<string, unknown>;
  factors?: Record<string, number>;
  penalties?: Array<{ type: string; amount: number; reason: string }>;
}
