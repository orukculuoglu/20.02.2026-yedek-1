/**
 * DataEnginePriorityCandidate — Phase 10 Output
 *
 * Represents a priority-ready pattern candidate extracted from a vehicle intelligence profile.
 *
 * This is NOT a scored, ranked, or decision object.
 * It is a preparation structure that organizes patterns for downstream consumption.
 *
 * Example:
 *
 * {
 *   priorityCandidateId: "PRIOR-SHA256-...",
 *   priorityCandidateType: "COMPONENT_PRIORITY_CANDIDATE",
 *   identityId: "VEH-2024-001",
 *   sourceEntityRef: "ENTITY-001",
 *   sourcePatternRefs: ["SIG-INTERP-001"],
 *   priorityKey: "brake_pad",
 *   priorityBasis: "high_recurrence",
 *   supportingEvidenceCount: 2,
 *   preparationTimestamp: "2024-02-01T16:00:00Z",
 *   properties: {
 *     involvementCount: 5,
 *     eventTypes: ["DIAGNOSTIC_INSPECTION", "REPAIR_REQUEST"]
 *   }
 * }
 */

import { DataEnginePriorityCandidateType } from '../types/DataEnginePriorityCandidateType';

export interface DataEnginePriorityCandidate {
  /**
   * Deterministic ID for this priority candidate.
   *
   * Generated from:
   * - identityId
   * - priorityCandidateType
   * - priorityKey
   * - sourceEntityRef
   *
   * Using: SHA-256 hash
   *
   * Ensures reproducibility: same inputs → same ID
   */
  priorityCandidateId: string;

  /**
   * Classification of the priority candidate.
   *
   * One of 5 types:
   * - COMPONENT_PRIORITY_CANDIDATE
   * - SERVICE_PRIORITY_CANDIDATE
   * - ACTOR_PRIORITY_CANDIDATE
   * - TEMPORAL_PRIORITY_CANDIDATE
   * - COMPOSITE_PRIORITY_CANDIDATE
   */
  priorityCandidateType: DataEnginePriorityCandidateType;

  /**
   * Vehicle identity anchoring.
   *
   * Unchanged from phase 9. All candidates trace to specific vehicle.
   */
  identityId: string;

  /**
   * Source entity reference.
   *
   * Unchanged from phase 9. Maintains link to original context.
   */
  sourceEntityRef: string;

  /**
   * References to Phase 8 interpreted signals that contributed to this candidate.
   *
   * Enables full traceability:
   * Priority Candidate ← Phase 8 Signals ← Phase 7 Signals ← Phase 6 Indexes ← ...
   *
   * Array of Phase 8 interpreted signal IDs.
   */
  sourcePatternRefs: string[];

  /**
   * Priority key — canonical identifier of what is being prepared.
   *
   * Examples:
   * - COMPONENT: "brake_pad", "suspension_arm", "engine_oil_filter"
   * - SERVICE: "MAINTENANCE_RECORD", "DIAGNOSTIC_INSPECTION", "REPAIR_REQUEST"
   * - ACTOR: "WORKSHOP_A:MECHANIC", "DIAGNOSTIC_CENTER:INSPECTOR"
   * - TEMPORAL: "2024-01-25", "2024-02-01"
   * - COMPOSITE: "brake_pad:MAINTENANCE_RECORD:WORKSHOP_A:MECHANIC" (multi-domain reference)
   *
   * Deterministic and derived from profile structures.
   */
  priorityKey: string;

  /**
   * Priority basis — structural explanation of why this pattern is prepared.
   *
   * Examples:
   * - "high_recurrence" (component involved in many events)
   * - "dense_cluster" (service concentrated in few types)
   * - "high_concentration" (actor dependency is strong)
   * - "high_density" (temporal clustering in time window)
   * - "composite_overlap_3" (3 domains converge on same pattern)
   *
   * Semantic classification of pattern structure. Not a decision indicator.
   */
  priorityBasis: string;

  /**
   * Count of Phase 8 interpreted signals supporting this candidate.
   *
   * Indicates structural evidence:
   * - 1: single domain's pattern
   * - 2+: multiple domains converge (composite candidate)
   *
   * Higher count suggests stronger structural evidence.
   */
  supportingEvidenceCount: number;

  /**
   * ISO timestamp when candidate was prepared.
   *
   * Typically same as preparationCandidate preparationTimestamp.
   * For audit and reproducibility.
   */
  preparationTimestamp: string;

  /**
   * Additional properties for candidate context.
   *
   * Example structures by type:
   *
   * COMPONENT:
   *   { involvementCount, eventTypes, recurrenceLevel }
   *
   * SERVICE:
   *   { clusterCount, frequency, lastOccurrence }
   *
   * ACTOR:
   *   { sourceId, role, involvementCount, specialization }
   *
   * TEMPORAL:
   *   { eventCount, densityLevel, timeWindow }
   *
   * COMPOSITE:
   *   { convergedDomains, componentId, serviceType, actorId, temporalWindow }
   *
   * Contents vary by priorityCandidateType.
   * Used for explanation and downstream processing.
   */
  properties: Record<string, unknown>;
}
