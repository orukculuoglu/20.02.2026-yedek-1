import { SignalEvaluationContextBuilder } from '../context';
import { SignalRuleEngine } from '../rules';
import { SignalScoringEngine } from '../scoring';
import { SignalBuilderEngine } from '../builder';
import {
  ExecuteSignalEngineInput,
  ExecuteSignalEngineResult,
} from './signal-runtime.types';
import { createSignalRuntimeSnapshot } from './signal-runtime.snapshot';

/**
 * Execute the complete Signal Engine pipeline.
 *
 * @param input - Pipeline execution input (evaluation input + rules)
 * @returns Complete execution result with context, matches, candidates, signals
 *
 * Pipeline flow:
 * 1. Build evaluation context from input
 * 2. Create rule engine with input rules
 * 3. Evaluate rules against context
 * 4. Score matches with scoring engine
 * 5. Build signals with builder engine
 * 6. Create runtime snapshot
 * 7. Return comprehensive result
 *
 * This function orchestrates all layers deterministically.
 * No rule logic, scoring logic, or builder logic is implemented here.
 */
export function executeSignalEngine(
  input: ExecuteSignalEngineInput,
): ExecuteSignalEngineResult {
  // 1. Build evaluation context
  const contextBuilder = new SignalEvaluationContextBuilder();
  const context = contextBuilder.build(input.evaluationInput);

  // 2. Create and execute rule engine
  const ruleEngine = new SignalRuleEngine(input.rules);
  const matches = ruleEngine.evaluate(context);

  // 3. Score matches
  const scoringEngine = new SignalScoringEngine();
  const candidates = scoringEngine.score(matches, context);

  // 4. Build signals
  const builderEngine = new SignalBuilderEngine();
  const signals = builderEngine.build(candidates, context);

  // 5. Create runtime snapshot
  const snapshot = createSignalRuntimeSnapshot({
    context,
    rules: input.rules,
    matches,
    candidates,
    signals,
  });

  // 6. Return comprehensive result
  return {
    context,
    matches,
    candidates,
    signals,
    snapshot,
  };
}
