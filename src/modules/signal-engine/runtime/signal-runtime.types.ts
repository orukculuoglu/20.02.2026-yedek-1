import { SignalEvaluationInput } from '../context';
import { SignalEvaluationContext } from '../context';
import { SignalRuleDefinition, SignalRuleMatch } from '../rules';
import { SignalCandidate } from '../scoring';
import { Signal } from '../domain';

/**
 * Input for executing the complete Signal Engine pipeline.
 */
export interface ExecuteSignalEngineInput {
  evaluationInput: SignalEvaluationInput;
  rules: SignalRuleDefinition[];
}

/**
 * Comprehensive result of Signal Engine execution.
 * Includes context, matches, candidates, signals, and metadata snapshot.
 */
export interface ExecuteSignalEngineResult {
  context: SignalEvaluationContext;
  matches: SignalRuleMatch[];
  candidates: SignalCandidate[];
  signals: Signal[];
  snapshot: SignalRuntimeSnapshot;
}

/**
 * Metadata snapshot of Signal Engine execution.
 * Summarizes counts and signal types for monitoring.
 */
export interface SignalRuntimeSnapshot {
  avid: string;
  vehicleId?: string;
  timestamp: number;
  ruleCount: number;
  matchCount: number;
  candidateCount: number;
  signalCount: number;
  signalTypes: string[];
}
