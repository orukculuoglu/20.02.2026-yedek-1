/**
 * Phase 8 — Signal Interpretation Module Exports
 *
 * Exports:
 * ✓ Type definitions (DataEngineInterpretedSignalType)
 * ✓ Data models (contracts)
 *
 * NOT exported:
 * ✗ Engine function (interpretSignals) — backend-only
 *
 * This maintains phase boundaries and prevents unintended usage.
 */

// Type exports
export { DataEngineInterpretedSignalType } from './types/DataEngineInterpretedSignalType';

// Model exports
export type { DataEngineInterpretedSignal } from './models/DataEngineInterpretedSignal';
export type { DataEngineSignalInterpretationCandidate } from './models/DataEngineSignalInterpretationCandidate';
export type { DataEngineSignalInterpretationResult } from './models/DataEngineSignalInterpretationResult';
