import { SignalCandidate } from '../scoring';
import { SignalEvaluationContext } from '../context';

/**
 * Input for building a Signal entity from a scored candidate.
 */
export interface SignalBuildInput {
  candidate: SignalCandidate;
  context: SignalEvaluationContext;
}
