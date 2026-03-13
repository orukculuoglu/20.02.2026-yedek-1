/**
 * Data Engine Signals Module
 * Exports predictive signals engine for vehicle intelligence analysis
 */

// Legacy exports
export {
  generatePredictiveSignals,
  type PredictiveSignal,
} from './predictiveSignalsEngine';

// Phase 7 — Signal Preparation Layer exports
// Types and models (safe for all contexts)
export { DataEngineSignalType } from './types/DataEngineSignalType';
export type { DataEngineSignalCandidate } from './models/DataEngineSignalCandidate';
export type { DataEngineSignalPreparationCandidate } from './models/DataEngineSignalPreparationCandidate';
export type { DataEngineSignalPreparationResult } from './models/DataEngineSignalPreparationResult';

// Engine function NOT exported here (requires Node.js crypto module)
// Import directly from engine module in backend/server-only code:
// import { prepareSignals } from '@/modules/data-engine/signals/engine/prepareSignals';
