/**
 * Signal candidate with deterministically calculated scoring attributes.
 * Ready for transformation into Signal entities.
 */
export interface SignalCandidate {
  ruleId: string;
  signalType: string;

  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  confidence: number;
  strength: number;

  timestamp: number;
  evidence?: Record<string, unknown>;
}

/**
 * Input for the signal scoring process.
 * Combines rule match result with evaluation context.
 */
export interface SignalScoringInput {
  ruleMatch: any; // SignalRuleMatch (imported separately to avoid circular deps)
  context: any; // SignalEvaluationContext (imported separately to avoid circular deps)
}
