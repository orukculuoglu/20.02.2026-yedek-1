/**
 * DataEngineInterpretedSignal — Phase 8 Output
 *
 * Represents an interpreted semantic pattern from Phase 7 signals.
 *
 * Interpreted signals remain traceable to source signals via sourceSignalRefs.
 * All fields are deterministic and reproducible.
 *
 * Example:
 *
 * {
 *   interpretedSignalId: "SIG-INTERP-SHA256-...",
 *   interpretedSignalType: "COMPONENT_DEGRADATION_PATTERN",
 *   identityId: "VEH-2024-001",
 *   sourceEntityRef: "ENTITY-OIL-CHANGE-001",
 *   sourceSignalRefs: ["SIG-PHASE7-001", "SIG-PHASE7-002"],
 *   patternKey: "oil_system",
 *   patternValue: "high_recurrence",
 *   supportingSignalCount: 2,
 *   interpretationTimestamp: "2024-01-15T09:30:00Z",
 *   properties: {
 *     involvementEvents: 3,
 *     eventTypes: ["MAINTENANCE_RECORD", "DIAGNOSTIC_INSPECTION"],
 *     timeSpan: "11 days"
 *   }
 * }
 */

import { DataEngineInterpretedSignalType } from '../types/DataEngineInterpretedSignalType';

export interface DataEngineInterpretedSignal {
  /**
   * Deterministic ID for this interpreted signal.
   *
   * Generated from:
   * - identityId
   * - interpretedSignalType
   * - patternKey
   * - sourceEntityRef
   *
   * Using: SHA-256 hash
   *
   * Ensures reproducibility: same inputs → same ID
   */
  interpretedSignalId: string;

  /**
   * Classification of the interpreted pattern.
   *
   * One of:
   * - TEMPORAL_ANOMALY_PATTERN (from TIMELINE_DENSITY)
   * - COMPONENT_DEGRADATION_PATTERN (from COMPONENT_RECURRENCE)
   * - ACTOR_DEPENDENCY_PATTERN (from ACTOR_CONCENTRATION)
   * - SERVICE_CLUSTER_PATTERN (from EVENT_TYPE_FREQUENCY)
   */
  interpretedSignalType: DataEngineInterpretedSignalType;

  /**
   * Vehicle identity anchoring.
   *
   * Unchanged from phase 7. All interpreted signals trace to specific vehicle.
   */
  identityId: string;

  /**
   * Source entity reference.
   *
   * Unchanged from phase 7. Maintains link to original entity processing context.
   */
  sourceEntityRef: string;

  /**
   * References to Phase 7 signals that supported this interpretation.
   *
   * Enables full traceability:
   * Interpreted Signal ← Phase 7 Signals ← Phase 6 Indexes ← Phase 5 Graph ← ...
   *
   * Array of Phase 7 signal IDs that were grouped into this interpretation.
   */
  sourceSignalRefs: string[];

  /**
   * Pattern identifier within interpretation type.
   *
   * Examples:
   * - COMPONENT_DEGRADATION_PATTERN: "oil_system", "brake_pad"
   * - ACTOR_DEPENDENCY_PATTERN: "WORKSHOP_A:MECHANIC"
   * - EVENT_TYPE_FREQUENCY: "MAINTENANCE_RECORD", "REPAIR_REQUEST"
   * - TEMPORAL_ANOMALY_PATTERN: "2024-01-15" (ISO date)
   *
   * Deterministic and derived from source signals.
   */
  patternKey: string;

  /**
   * Pattern value or intensity.
   *
   * Examples:
   * - "high_recurrence", "medium_recurrence"
   * - "high_concentration", "low_concentration"
   * - "dense_cluster", "sparse_cluster"
   * - "high_frequency"
   *
   * Semantic interpretation of signal grouping.
   */
  patternValue: string;

  /**
   * Count of Phase 7 signals supporting this interpretation.
   *
   * Indicates confidence/strength:
   * - 1: single signal interpretation
   * - 2+: grouped signals
   *
   * Higher count suggests stronger pattern evidence.
   */
  supportingSignalCount: number;

  /**
   * ISO timestamp when interpretation was generated.
   *
   * Typically same as candidate interpretedAt.
   * For audit and reproducibility.
   */
  interpretationTimestamp: string;

  /**
   * Additional properties for pattern context.
   *
   * Example structure:
   * {
   *   involvedEventTypes?: string[],
   *   timeSpan?: string,
   *   signalFamily?: string,
   *   groupingReason?: string,
   *   densityMetric?: number,
   *   concentrationLevel?: string,
   *   clusterStrength?: string
   * }
   *
   * Contents vary by interpretedSignalType.
   * Used for explanation and downstream processing.
   */
  properties: Record<string, unknown>;
}
