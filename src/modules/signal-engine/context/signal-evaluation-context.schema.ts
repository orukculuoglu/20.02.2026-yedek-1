import { SignalEvaluationContext } from './signal-evaluation-context.types';

/**
 * Validation error for SignalEvaluationContext.
 * Provides typed error handling for context validation failures.
 */
export class SignalEvaluationContextValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = 'SignalEvaluationContextValidationError';
  }
}

/**
 * Validate a SignalEvaluationContext with type assertion.
 *
 * @param context - Unknown value to validate
 * @returns Validated SignalEvaluationContext
 * @throws SignalEvaluationContextValidationError if validation fails
 *
 * Validation rules:
 * - avid must be non-empty string
 * - timestamp must be number
 * - vehicleId must be string if present
 * - indexes/composites/events/graph must be objects if present
 * - vehicleContext must be object if present
 * - metadata must be object if present
 */
export function validateSignalEvaluationContext(
  context: unknown,
): SignalEvaluationContext {
  if (!context || typeof context !== 'object') {
    throw new SignalEvaluationContextValidationError(
      'Context must be an object',
      'root',
    );
  }

  const obj = context as Record<string, unknown>;

  // Validate required avid
  if (typeof obj.avid !== 'string' || obj.avid.length === 0) {
    throw new SignalEvaluationContextValidationError(
      'avid must be a non-empty string',
      'avid',
    );
  }

  // Validate required timestamp
  if (typeof obj.timestamp !== 'number' || obj.timestamp <= 0) {
    throw new SignalEvaluationContextValidationError(
      'timestamp must be a positive number',
      'timestamp',
    );
  }

  // Validate optional vehicleId
  if (obj.vehicleId !== undefined && typeof obj.vehicleId !== 'string') {
    throw new SignalEvaluationContextValidationError(
      'vehicleId must be a string if present',
      'vehicleId',
    );
  }

  // Validate optional indexes
  if (
    obj.indexes !== undefined &&
    (typeof obj.indexes !== 'object' || obj.indexes === null)
  ) {
    throw new SignalEvaluationContextValidationError(
      'indexes must be an object if present',
      'indexes',
    );
  }

  // Validate optional composites
  if (
    obj.composites !== undefined &&
    (typeof obj.composites !== 'object' || obj.composites === null)
  ) {
    throw new SignalEvaluationContextValidationError(
      'composites must be an object if present',
      'composites',
    );
  }

  // Validate optional graph
  if (
    obj.graph !== undefined &&
    (typeof obj.graph !== 'object' || obj.graph === null)
  ) {
    throw new SignalEvaluationContextValidationError(
      'graph must be an object if present',
      'graph',
    );
  }

  // Validate optional events
  if (
    obj.events !== undefined &&
    (typeof obj.events !== 'object' || obj.events === null)
  ) {
    throw new SignalEvaluationContextValidationError(
      'events must be an object if present',
      'events',
    );
  }

  // Validate optional vehicleContext
  if (
    obj.vehicleContext !== undefined &&
    (typeof obj.vehicleContext !== 'object' || obj.vehicleContext === null)
  ) {
    throw new SignalEvaluationContextValidationError(
      'vehicleContext must be an object if present',
      'vehicleContext',
    );
  }

  // Validate optional metadata
  if (
    obj.metadata !== undefined &&
    (typeof obj.metadata !== 'object' || obj.metadata === null)
  ) {
    throw new SignalEvaluationContextValidationError(
      'metadata must be an object if present',
      'metadata',
    );
  }

  // Since all fields have been validated at runtime, cast to target type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return obj as any as SignalEvaluationContext;
}

/**
 * Type predicate to check if a value is a valid SignalEvaluationContext.
 *
 * @param context - Value to check
 * @returns true if context is a valid SignalEvaluationContext
 *
 * Does not throw; returns boolean for control flow use.
 */
export function isValidSignalEvaluationContext(
  context: unknown,
): context is SignalEvaluationContext {
  try {
    validateSignalEvaluationContext(context);
    return true;
  } catch {
    return false;
  }
}
