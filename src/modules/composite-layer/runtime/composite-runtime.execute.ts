import type { CompositeType } from '../core/composite.enums';
import type { CompositeInputRef } from '../contracts/composite-input.types';
import type { CompositeInputValidationContext } from '../contracts/composite-input.types';
import type {
  CompositeIndexChangeEvent,
  CompositeRuntimeExecutionResult,
  CompositeRuntimeExecutionUnit,
} from './composite-runtime.types';
import { getAffectedCompositeTypesForIndex } from './composite-runtime.triggers';
import { buildCompositeRuntimeInputSet } from './composite-runtime.input';
import { validateCompositeInputs } from '../contracts';
import { calculateCompositeScore } from '../weighting';
import { buildCompositeRecord } from '../builder';
import { buildCompositePublicationEnvelope } from '../publisher';

/**
 * Execute composite runtime orchestration for an index change event.
 *
 * Flow:
 * 1. Resolve affected composite types
 * 2. For each composite type:
 *    a. Build runtime input set
 *    b. Validate inputs
 *    c. If eligible: calculate weighting → build record → build envelope
 *    d. If not eligible: create skipped unit
 * 3. Return complete execution result
 *
 * No side effects, fully deterministic.
 *
 * @param event - Index change event that triggered execution
 * @param availableInputs - Available composite input references
 * @returns CompositeRuntimeExecutionResult with all execution units
 */
export function executeCompositeRuntime(
  event: CompositeIndexChangeEvent,
  availableInputs: CompositeInputRef[],
): CompositeRuntimeExecutionResult {
  // 1. Resolve affected composite types
  const affectedCompositeTypes = getAffectedCompositeTypesForIndex(
    event.indexType,
  );

  // 2. Execute each composite type in order
  const executionUnits: CompositeRuntimeExecutionUnit[] = [];

  for (const compositeType of affectedCompositeTypes) {
    // a. Build runtime input set
    const inputSet = buildCompositeRuntimeInputSet(
      compositeType,
      availableInputs,
      event.occurredAt,
      event.vehicleId,
      event.fleetId,
    );

    // b. Validate inputs
    const validationContext: CompositeInputValidationContext = {
      evaluationTime: event.occurredAt,
    };
    const validationResult = validateCompositeInputs(
      compositeType,
      inputSet.inputs,
      validationContext,
    );

    // c. If not eligible, skip to next composite type
    if (!validationResult.eligible) {
      const skippedUnit: CompositeRuntimeExecutionUnit = {
        compositeType,
        validationResult,
        executed: false,
        skippedReason: 'VALIDATION_NOT_ELIGIBLE',
      };
      executionUnits.push(skippedUnit);
      continue;
    }

    // d. If eligible, proceed with full execution
    // Calculate weighting
    const weightingResult = calculateCompositeScore(
      compositeType,
      validationResult.acceptedInputs,
    );

    // Calculate record confidence from accepted inputs only
    let recordConfidence: number = 0;
    if (validationResult.acceptedInputs.length > 0) {
      const confSum = validationResult.acceptedInputs.reduce(
        (acc, input) => acc + input.confidence,
        0,
      );
      recordConfidence = confSum / validationResult.acceptedInputs.length;
    }

    // Build composite record
    const buildResult = buildCompositeRecord({
      compositeType,
      weightingResult,
      acceptedInputs: validationResult.acceptedInputs,
      confidence: recordConfidence,
      recordVersion: '1.0.0',
      createdAt: event.occurredAt,
      vehicleId: event.vehicleId,
      fleetId: event.fleetId,
    });

    // Extract record from result
    const record = buildResult.record;

    // Build publication envelope
    const publication = buildCompositePublicationEnvelope(record);

    // Extract signal payload from publication
    const signalPayload = publication.signalPayload;

    // Create execution unit
    const executedUnit: CompositeRuntimeExecutionUnit = {
      compositeType,
      validationResult,
      weightingResult,
      record,
      publication,
      signalPayload,
      executed: true,
    };

    executionUnits.push(executedUnit);
  }

  return {
    event,
    affectedCompositeTypes,
    executionUnits,
    executedAt: event.occurredAt,
  };
}
