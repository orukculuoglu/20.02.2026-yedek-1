/**
 * Relationship Type Definitions
 * Defines explicit relationships between different windows.
 * Deterministic, no implicit causality or inference.
 * Uses discriminated unions to prevent structurally meaningless combinations.
 */

/**
 * ReferenceRelationType enum
 * Defines how a window refers to or relates to another window.
 * - DEPENDS_ON: Window B depends on values from window A
 * - EXTENDS: Window B extends the time axis of window A
 * - SUBSET_OF: Window B is a time subset of window A
 * - SUPERSET_OF: Window B contains window A within its time span
 * - PARALLEL: Window B runs concurrently with window A
 * - SEQUENTIAL: Window B immediately follows window A
 * - DISJOINT: Window B has no temporal overlap with window A
 */
export enum ReferenceRelationType {
  DEPENDS_ON = "DEPENDS_ON",
  EXTENDS = "EXTENDS",
  SUBSET_OF = "SUBSET_OF",
  SUPERSET_OF = "SUPERSET_OF",
  PARALLEL = "PARALLEL",
  SEQUENTIAL = "SEQUENTIAL",
  DISJOINT = "DISJOINT",
}

/**
 * BaselineRelationType enum
 * Defines the nature of a baseline window relationship.
 * - CONTROL_BASELINE: Use as unaffected control for anomaly detection
 * - HISTORICAL_BASELINE: Use as historical normal for trend comparison
 * - EXPECTED_BASELINE: Use as expected/desired state for variance analysis
 * - SEASONAL_BASELINE: Use as seasonal normal for cyclical comparison
 */
export enum BaselineRelationType {
  CONTROL_BASELINE = "CONTROL_BASELINE",
  HISTORICAL_BASELINE = "HISTORICAL_BASELINE",
  EXPECTED_BASELINE = "EXPECTED_BASELINE",
  SEASONAL_BASELINE = "SEASONAL_BASELINE",
}

/**
 * RelationshipArity enum
 * Defines the cardinality of window relationships.
 * - ONE_TO_ONE: Single window related to single window
 * - ONE_TO_MANY: Single window related to multiple windows
 * - MANY_TO_ONE: Multiple windows related to single window
 * - MANY_TO_MANY: Multiple windows related to multiple windows
 */
export enum RelationshipArity {
  ONE_TO_ONE = "ONE_TO_ONE",
  ONE_TO_MANY = "ONE_TO_MANY",
  MANY_TO_ONE = "MANY_TO_ONE",
  MANY_TO_MANY = "MANY_TO_MANY",
}

/**
 * ReferenceWindowRelationship
 * Relationship variant for reference relationships.
 * Explicitly requires reference semantics.
 */
export interface ReferenceWindowRelationship {
  kind: "REFERENCE";
  sourceWindowId: string;
  targetWindowId: string;
  relationType: ReferenceRelationType;
  arity: RelationshipArity;
}

/**
 * BaselineWindowRelationship
 * Relationship variant for baseline relationships.
 * Explicitly requires baseline semantics.
 */
export interface BaselineWindowRelationship {
  kind: "BASELINE";
  sourceWindowId: string;
  targetWindowId: string;
  baselineType: BaselineRelationType;
  arity: RelationshipArity;
}

/**
 * WindowRelationship
 * Discriminated union for window relationships.
 * Ensures only one relationship kind per relationship instance.
 * No structurally meaningless combinations (both/neither types) are possible.
 */
export type WindowRelationship = 
  | ReferenceWindowRelationship
  | BaselineWindowRelationship;
