/**
 * Multi-Window Comparison Foundation Contracts
 * Structural bindings for multiple windows in explicit comparison arrangements.
 * Extends existing comparison structures with arrangement-aware patterns.
 * 
 * Domain concepts:
 * - Comparison arrangement: pairwise, anchored, baseline_set, rolling_set, explicit_group
 * - Comparison member: explicit window + role + ordering + timestamps
 * - Comparison structure: identity + members + arrangement + anchors
 * 
 * Rules:
 * - All arrangements explicitly provided by caller
 * - No inferred arrangements, no inferred ordering
 * - No implicit defaults, no semantic inference
 * - Pure structural contracts only
 * - Reuses ComparisonWindowRole from existing contracts
 */

import type { ComparisonWindowRole } from "./ComparisonEntities.ts";

/**
 * ComparisonArrangementType
 * Explicit structural arrangement for how windows are organized in comparison.
 * Caller must specify which arrangement applies.
 * 
 * - pairwise: two windows compared directly
 * - anchored: one or more windows compared against anchor(s)
 * - baseline_set: multiple windows compared against baseline
 * - rolling_set: ordered set of windows for sequential comparison
 * - explicit_group: arbitrary grouping with explicit member relationships
 */
export type ComparisonArrangementType =
  | "pairwise"
  | "anchored"
  | "baseline_set"
  | "rolling_set"
  | "explicit_group";

/**
 * ComparisonMember
 * Explicit binding of a window into a comparison structure.
 * Includes window identity, role, optional ordering, and membership timestamp.
 */
export interface ComparisonMember {
  /** Window identifier */
  windowId: string;

  /** Explicit role this window plays in the comparison */
  roleInComparison: ComparisonWindowRole;

  /** Optional position/ordering in comparison sequence (caller-provided, not auto-generated) */
  positionInComparison?: number;

  /** Timestamp when window was bound to comparison (caller-provided) */
  membershipEstablishedAt: number;

  /** Optional metadata for membership context */
  membershipMetadata?: Record<string, unknown>;
}

/**
 * ComparisonStructure
 * Identity and composition of a multi-window comparison.
 * Contains explicit members, arrangement type, and optional anchor references.
 */
export interface ComparisonStructure {
  /** Unique identifier for this comparison structure */
  comparisonStructureId: string;

  /** Explicit list of member windows */
  members: ComparisonMember[];

  /** Explicit arrangement type (caller must specify) */
  arrangementType: ComparisonArrangementType;

  /** Optional target window for target-centric comparisons (caller-provided) */
  targetWindowId?: string;

  /** Optional reference window for reference-based comparisons (caller-provided) */
  referenceWindowId?: string;

  /** Optional baseline window for baseline comparisons (caller-provided) */
  baselineWindowId?: string;

  /** Timestamp when comparison structure was established (caller-provided) */
  comparisonEstablishedAt: number;

  /** Optional metadata for comparison context */
  comparisonMetadata?: Record<string, unknown>;
}

/**
 * ComparisonSet
 * Ordered set of windows with explicit membership tracking.
 * Supports multi-window groupings with optional anchor/baseline anchors.
 */
export interface ComparisonSet {
  /** Unique identifier for this comparison set */
  comparisonSetId: string;

  /** Ordered list of window identifiers (caller-provided order) */
  windowIds: string[];

  /** Explicit arrangement type for this set (caller must specify) */
  arrangementType: ComparisonArrangementType;

  /** Explicit membership list with roles and ordering */
  membershipList: ComparisonMember[];

  /** Optional target window if arrangement is target-centric (caller-provided) */
  targetWindowId?: string;

  /** Optional list of reference anchor window IDs (caller-provided) */
  referenceAnchors?: string[];

  /** Optional list of baseline anchor window IDs (caller-provided) */
  baselineAnchors?: string[];

  /** Timestamp when set was established (caller-provided) */
  setEstablishedAt: number;

  /** Optional metadata for set context */
  setMetadata?: Record<string, unknown>;
}

/**
 * AnchoredComparison
 * Explicit binding of windows around one or more anchors.
 * Support for anchor-centric comparison arrangements.
 */
export interface AnchoredComparison {
  /** Unique identifier for this anchored comparison */
  anchoredComparisonId: string;

  /** Anchor window ID (anchor must exist in members) */
  anchorWindowId: string;

  /** Role of anchor window */
  anchorRole: ComparisonWindowRole;

  /** Explicit list of windows being compared against anchor */
  comparedWindowIds: string[];

  /** Roles of compared windows (must match length of comparedWindowIds) */
  comparedWindowRoles: ComparisonWindowRole[];

  /** Timestamp when anchored comparison was established (caller-provided) */
  anchoringEstablishedAt: number;

  /** Optional metadata for anchoring context */
  anchoringMetadata?: Record<string, unknown>;
}

/**
 * BaselineComparison
 * Explicit binding of windows against a baseline.
 * Support for baseline-set comparison arrangements.
 */
export interface BaselineComparison {
  /** Unique identifier for this baseline comparison */
  baselineComparisonId: string;

  /** Baseline window ID */
  baselineWindowId: string;

  /** Explicit list of windows being compared against baseline */
  comparedWindowIds: string[];

  /** Role each compared window plays (typically "peer" or specific role) */
  comparedWindowRole: ComparisonWindowRole;

  /** Timestamp when baseline comparison was established (caller-provided) */
  baselineEstablishedAt: number;

  /** Optional metadata for baseline context */
  baselineMetadata?: Record<string, unknown>;
}

/**
 * RollingComparison
 * Explicit ordered sequence of windows for rolling/sequential comparison.
 * Support for rolling_set arrangement with explicit window ordering.
 */
export interface RollingComparison {
  /** Unique identifier for this rolling comparison */
  rollingComparisonId: string;

  /** Ordered window IDs (sequence is caller-provided, not inferred) */
  orderedWindowIds: string[];

  /** Explicit roles for each window in sequence (must match orderedWindowIds length) */
  windowRoles: ComparisonWindowRole[];

  /** Optional explicit segment boundaries (caller-provided if needed) */
  segmentBoundaries?: number[];

  /** Timestamp when rolling comparison was established (caller-provided) */
  rollingEstablishedAt: number;

  /** Optional metadata for rolling context */
  rollingMetadata?: Record<string, unknown>;
}
