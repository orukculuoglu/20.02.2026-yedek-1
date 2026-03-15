import { ExecuteSignalEngineResult } from './signal-runtime.types';

/**
 * Create a structured log object from Signal Engine execution result.
 *
 * @param result - ExecuteSignalEngineResult to log
 * @returns Structured log object
 *
 * Log includes:
 * - avid, vehicleId, timestamp
 * - execution counts (rules, matches, candidates, signals)
 * - signal types
 *
 * No console usage. Returns structured data only.
 */
export function createSignalRuntimeLog(
  result: ExecuteSignalEngineResult,
): Record<string, unknown> {
  return {
    avid: result.snapshot.avid,
    vehicleId: result.snapshot.vehicleId,
    timestamp: result.snapshot.timestamp,
    ruleCount: result.snapshot.ruleCount,
    matchCount: result.snapshot.matchCount,
    candidateCount: result.snapshot.candidateCount,
    signalCount: result.snapshot.signalCount,
    signalTypes: result.snapshot.signalTypes,
  };
}
