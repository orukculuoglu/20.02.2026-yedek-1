// Type exports
export type {
  CompositeIndexChangeEvent,
  CompositeRuntimeInputSet,
  CompositeRuntimeExecutionUnit,
  CompositeRuntimeExecutionResult,
  CompositeRuntimeIntegrationResult,
} from './composite-runtime.types';

// Trigger resolution exports
export { getAffectedCompositeTypesForIndex, COMPOSITE_TRIGGER_MAP } from './composite-runtime.triggers';

// Input preparation exports
export {
  sortCompositeInputsDeterministically,
  filterCompositeInputsForEventContext,
  buildCompositeRuntimeInputSet,
} from './composite-runtime.input';

// Runtime execution exports
export { executeCompositeRuntime } from './composite-runtime.execute';

// Integration exports
export { integrateCompositeRuntimeResult } from './composite-runtime.integration';
