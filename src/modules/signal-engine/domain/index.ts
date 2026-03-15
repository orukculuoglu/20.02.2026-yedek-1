/**
 * Signal Engine domain module barrel exports
 */

export * from './signal.enums';
export type { Signal } from './signal.types';
export type { SignalAction } from './signal-action.types';
export type { SignalThreshold } from './signal-threshold.types';
export type {
  IndexReference,
  CompositeReference,
  EventReference,
  GraphReference,
} from './signal-reference.types';
export { SignalEntity } from './signal.entity';
export type { CreateSignalInput, UpdateSignalStatusInput } from './signal.entity';
export { validateSignal, isValidSignal, SignalValidationError } from './signal.schema';
