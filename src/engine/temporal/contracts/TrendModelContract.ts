/**
 * Trend Model Foundation Contracts
 * Structural bindings for trend representation and analysis.
 * Pure contracts - no calculation logic, no interpretation, no runtime behavior.
 * 
 * Domain concepts:
 * - Trend direction: directional classification (increasing, decreasing, flat, mixed, undefined)
 * - Trend strength: magnitude classification (weak, moderate, strong, extreme, undefined)
 * - Trend input surface: structural references for future trend analysis
 * - Trend identity: unique structural identification
 * - Trend structure: core trend binding with direction and strength
 * 
 * Rules:
 * - All directions, strengths, classifications explicitly provided by caller
 * - No inferred directions, no inferred strengths, no inferred classifications
 * - No implicit defaults, no semantic inference
 * - Input surface contains only references (no values)
 * - Pure structural contracts only
 * - No calculation fields, no derived values
 */

import type { ComparisonWindowRole } from "./ComparisonEntities.ts";

/**
 * TrendDirection
 * Explicit directional classification for trend movement.
 * Caller must specify which direction applies.
 */
export type TrendDirection = "increasing" | "decreasing" | "flat" | "mixed" | "undefined";

/**
 * TrendStrength
 * Explicit magnitude/strength classification for trend intensity.
 * Caller must specify which strength applies.
 */
export type TrendStrength = "weak" | "moderate" | "strong" | "extreme" | "undefined";

/**
 * TrendClassificationType
 * Explicit caller-facing classification label for trend category.
 * Caller must specify which classification applies.
 */
export type TrendClassificationType =
  | "directional_trend"
  | "magnitude_trend"
  | "continuity_trend"
  | "distribution_trend"
  | "custom_trend";

/**
 * TrendInputSurface
 * Structural binding of source references used for trend calculation.
 * Contains explicit window and comparison references, no calculated values.
 */
export interface TrendInputSurface {
  /** Current analysis window (required) */
  currentWindowId: string;

  /** Previous window for delta comparison (required) */
  previousWindowId: string;

  /** Optional baseline window for baseline comparison */
  baselineWindowId?: string;

  /** Optional comparison structure ID for structural analysis */
  comparisonStructureId?: string;

  /** Optional comparison set ID for set-based analysis */
  comparisonSetId?: string;

  /** Optional lineage chain ID for chain-based analysis */
  lineageChainId?: string;

  /** Timestamp when input surface was established (caller-provided) */
  inputSurfaceEstablishedAt: number;

  /** Optional metadata for input context */
  inputSurfaceMetadata?: Record<string, unknown>;
}

/**
 * TrendIdentity
 * Unique structural identity for a trend model.
 */
export interface TrendIdentity {
  /** Unique identifier for this trend */
  trendId: string;

  /** Explicit type/category of trend */
  trendType: string;

  /** Timestamp when trend identity was established (caller-provided) */
  trendEstablishedAt: number;

  /** Optional metadata for identity context */
  identityMetadata?: Record<string, unknown>;
}

/**
 * TrendStructure
 * Core structural contract for a trend.
 * Binds identity, input, direction, and strength.
 */
export interface TrendStructure {
  /** Unique identifier for this trend */
  trendId: string;

  /** Explicit type/category of trend */
  trendType: string;

  /** Input surface with window and comparison references */
  inputSurface: TrendInputSurface;

  /** Explicit directional classification (caller must specify) */
  direction: TrendDirection;

  /** Explicit strength classification (caller must specify) */
  strength: TrendStrength;

  /** Optional caller-provided classification label */
  classificationLabel?: TrendClassificationType;

  /** Timestamp when trend structure was established (caller-provided) */
  trendEstablishedAt: number;

  /** Optional metadata for trend context */
  trendMetadata?: Record<string, unknown>;
}

/**
 * TrendSet
 * Explicit grouping of multiple trends.
 */
export interface TrendSet {
  /** Unique identifier for this trend set */
  trendSetId: string;

  /** Ordered list of trend IDs in set */
  trendIds: string[];

  /** Explicit type/category for set organization */
  setType: string;

  /** Timestamp when set was established (caller-provided) */
  setEstablishedAt: number;

  /** Optional metadata for set context */
  setMetadata?: Record<string, unknown>;
}

/**
 * TrendMembership
 * Explicit membership of a trend inside a trend set.
 */
export interface TrendMembership {
  /** Trend identifier */
  trendId: string;

  /** Set identifier */
  trendSetId: string;

  /** Optional position/ordering in set (caller-provided) */
  positionInSet?: number;

  /** Timestamp when trend was bound to set (caller-provided) */
  membershipEstablishedAt: number;

  /** Optional metadata for membership context */
  membershipMetadata?: Record<string, unknown>;
}

/**
 * FullTrendContext
 * Complete structural context for a trend.
 * Contains identity, input surface, and optional temporal relationships.
 */
export interface FullTrendContext {
  /** Unique identifier for this context */
  contextId: string;

  /** Trend identity binding */
  identity: TrendIdentity;

  /** Input surface with references */
  inputSurface: TrendInputSurface;

  /** Optional previous trend ID in sequence */
  previousTrendId?: string;

  /** Optional next trend ID in sequence */
  nextTrendId?: string;

  /** Optional array of related trend IDs */
  relatedTrendIds?: string[];

  /** Timestamp when context was established (caller-provided) */
  contextEstablishedAt: number;

  /** Optional metadata for context */
  contextMetadata?: Record<string, unknown>;
}
