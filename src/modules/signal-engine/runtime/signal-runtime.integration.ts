import {
  ExecuteSignalEngineInput,
  ExecuteSignalEngineResult,
} from './signal-runtime.types';
import { executeSignalEngine } from './signal-runtime.execute';

/**
 * Convenience wrapper class for Signal Engine runtime execution.
 * Provides object-oriented interface to the pipeline.
 *
 * This class wraps executeSignalEngine() function internally.
 */
export class SignalRuntimeIntegration {
  /**
   * Execute the Signal Engine pipeline.
   *
   * @param input - Pipeline execution input (evaluation input + rules)
   * @returns Complete execution result
   */
  execute(input: ExecuteSignalEngineInput): ExecuteSignalEngineResult {
    return executeSignalEngine(input);
  }
}
