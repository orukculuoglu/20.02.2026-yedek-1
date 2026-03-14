/**
 * Main composite record builder
 * Assembles canonical composite records from validated inputs and weights
 */

import type { CompositeRecordBuildInput, CompositeRecordBuildResult } from './composite-builder.types';
import { resolveCompositeBandForRecord } from './composite-builder.band';
import { resolveCompositeSeverityForRecord } from './composite-builder.severity';
import { deriveCompositeValidityWindow } from './composite-builder.validity';
import { createCompositeBuilderMetadata } from './composite-builder.metadata';
import { buildCompositeExplanation } from './composite-builder.explanation';
import { CompositeType } from '../core/composite.enums';
import type {
  CompositeRecord,
  BaseCompositeRecord,
  VehicleHealthComposite,
  OperationalRiskComposite,
  InsuranceExposureComposite,
  FleetVehicleComposite,
  TrustAdjustedComposite,
} from '../core/composite.types';
import type { CompositeSourceIndexRef } from '../core/composite.source-ref';
import type { CompositeBand } from '../core/composite.band';
import type { CompositeSeverity } from '../core/composite.severity';
import type { CompositeExplanation } from '../core/composite.explanation';
import type { CompositeMetadata } from '../core/composite.metadata';

/**
 * Strictly typed base fields for composed records
 * Avoids any usage and provides full type safety
 */
interface CompositeRecordBaseFields {
  compositeId: string;
  compositeType: CompositeType;
  score: number;
  normalizedScore: number;
  confidence: number;
  band: CompositeBand;
  severity: CompositeSeverity;
  explanation: CompositeExplanation;
  sourceIndexRefs: CompositeSourceIndexRef[];
  createdAt: string;
  validFrom?: string;
  validTo?: string;
  version: string;
  metadata: CompositeMetadata;
}

/**
 * Build a canonical composite record from inputs and weighting results
 *
 * Flow:
 * 1. Resolve band from normalized score
 * 2. Resolve severity from score, type, and confidence
 * 3. Derive validity window from accepted inputs
 * 4. Build explanation
 * 5. Map accepted inputs to source index refs
 * 6. Create metadata
 * 7. Create deterministic composite ID
 * 8. Assemble fully typed record
 *
 * @param input - Build input with all required parameters
 * @returns Build result containing the canonical composite record
 */
export function buildCompositeRecord(input: CompositeRecordBuildInput): CompositeRecordBuildResult {
  const {
    compositeType,
    weightingResult,
    acceptedInputs,
    confidence,
    recordVersion,
    createdAt,
    vehicleId,
    fleetId,
  } = input;

  // 1. Resolve band
  const band = resolveCompositeBandForRecord(weightingResult.normalizedScore);

  // 2. Resolve severity
  const severity = resolveCompositeSeverityForRecord(
    compositeType,
    weightingResult.normalizedScore,
    confidence,
  );

  // 3. Derive validity window
  const validityWindow = deriveCompositeValidityWindow(acceptedInputs);

  // 4. Build explanation
  const explanation = buildCompositeExplanation(
    compositeType,
    weightingResult,
    confidence,
    acceptedInputs,
  );

  // 5. Map accepted inputs to source index refs
  const sourceIndexRefs: CompositeSourceIndexRef[] = acceptedInputs.map((input) => ({
    indexType: input.indexType.toString(),
    indexId: input.indexId,
    score: input.score,
    confidence: input.confidence,
    validFrom: input.validFrom,
    validTo: input.validTo,
  }));

  // 6. Create metadata
  const metadata = createCompositeBuilderMetadata(compositeType, recordVersion, createdAt);

  // 7. Create deterministic composite ID
  const idContext = vehicleId ?? fleetId ?? 'GLOBAL';
  const compositeId = `${compositeType}:${idContext}:${createdAt}`;

  // 8. Assemble fully typed record by composite type
  const baseRecord: CompositeRecordBaseFields = {
    compositeId,
    compositeType,
    score: weightingResult.normalizedScore,
    normalizedScore: weightingResult.normalizedScore,
    confidence,
    band,
    severity,
    explanation,
    sourceIndexRefs,
    createdAt,
    validFrom: validityWindow.validFrom,
    validTo: validityWindow.validTo,
    version: recordVersion,
    metadata,
  };

  const record = buildTypedRecord(compositeType, baseRecord, vehicleId, fleetId);

  return {
    record,
  };
}

/**
 * Build a typed record based on composite type
 * Ensures each record matches its specific interface
 */
function buildTypedRecord(
  compositeType: CompositeType,
  baseFields: CompositeRecordBaseFields,
  vehicleId?: string,
  fleetId?: string,
): CompositeRecord {
  switch (compositeType) {
    case CompositeType.VEHICLE_HEALTH: {
      const record: VehicleHealthComposite = {
        ...baseFields,
        compositeType: CompositeType.VEHICLE_HEALTH,
        vehicleId,
      };
      return record;
    }

    case CompositeType.OPERATIONAL_RISK: {
      const record: OperationalRiskComposite = {
        ...baseFields,
        compositeType: CompositeType.OPERATIONAL_RISK,
        vehicleId,
      };
      return record;
    }

    case CompositeType.INSURANCE_EXPOSURE: {
      const record: InsuranceExposureComposite = {
        ...baseFields,
        compositeType: CompositeType.INSURANCE_EXPOSURE,
        vehicleId,
      };
      return record;
    }

    case CompositeType.FLEET_VEHICLE: {
      const record: FleetVehicleComposite = {
        ...baseFields,
        compositeType: CompositeType.FLEET_VEHICLE,
        fleetId,
      };
      return record;
    }

    case CompositeType.TRUST_ADJUSTED: {
      const record: TrustAdjustedComposite = {
        ...baseFields,
        compositeType: CompositeType.TRUST_ADJUSTED,
        vehicleId,
        fleetId,
      };
      return record;
    }

    default: {
      // Exhaustive check
      const exhaustive: never = compositeType;
      throw new Error(`Unhandled composite type: ${exhaustive}`);
    }
  }
}
