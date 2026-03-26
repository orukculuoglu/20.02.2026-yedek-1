/**
 * Core Temporal Contracts
 * Foundation types for multi-window temporal analysis.
 * Strictly deterministic, no implicit behavior, no business logic.
 */

import type { WindowTypeContract } from "./WindowType.ts";
import type { TemporalComparisonContract } from "./TemporalComparison.ts";
import type { WindowRelationship } from "./RelationshipTypes.ts";

/**
 * SetPurpose enum
 * Explicitly classifies the purpose of a multi-window set.
 * Replaces free-form text with deterministic classification.
 * - BASELINE_COMPARISON: Compare current window against historical baseline
 * - TREND_ANALYSIS: Analyze temporal trends across sequential windows
 * - ANOMALY_DETECTION: Compare observation window against control baseline
 * - CONTROL_COMPARISON: Compare treatment window against control window
 * - SEQUENTIAL_ANALYSIS: Analyze progression of states across ordered windows
 * - COMPOSITE_EVALUATION: Multi-window evaluation for complex analysis
 */
export enum SetPurpose {
  BASELINE_COMPARISON = "BASELINE_COMPARISON",
  TREND_ANALYSIS = "TREND_ANALYSIS",
  ANOMALY_DETECTION = "ANOMALY_DETECTION",
  CONTROL_COMPARISON = "CONTROL_COMPARISON",
  SEQUENTIAL_ANALYSIS = "SEQUENTIAL_ANALYSIS",
  COMPOSITE_EVALUATION = "COMPOSITE_EVALUATION",
}

/**
 * TemporalWindowBoundary
 * Precise time boundaries for a window's temporal span.
 * Represents the actual period of observation or analysis.
 * Both timestamps are explicit and required (no defaults).
 */
export interface TemporalWindowBoundary {
  startTimestamp: number; // Unix milliseconds, inclusive
  endTimestamp: number;   // Unix milliseconds, inclusive
}

/**
 * TemporalWindowMetadata
 * Explicit metadata about a window's creation.
 * No runtime generation. All values must be provided at creation.
 * 
 * Note: The window's temporal span is captured in 'boundary', not here.
 * This metadata tracks only the lifecycle of the window definition itself.
 */
export interface TemporalWindowMetadata {
  createdAt: number;  // Timestamp of window definition (Unix ms)
  version: string;    // Semantic versioning of this window contract
}

/**
 * MultiWindowTemporalContract
 * The complete contract for a temporal window in multi-window analysis.
 * Every field is explicit and required. No hidden defaults.
 * 
 * Canonical Identity: The 'id' field is the single authoritative identifier.
 * No internal duplication of identifiers.
 */
export interface MultiWindowTemporalContract {
  // Canonical identity - single authoritative identifier
  id: string;
  
  // Window creation metadata (lifecycle tracking only)
  metadata: TemporalWindowMetadata;

  // Window classification
  windowType: WindowTypeContract;

  // Temporal structure
  boundary: TemporalWindowBoundary;
  comparison: TemporalComparisonContract;

  // Relationships to other windows
  relationships: WindowRelationship[];

  // No business logic, scoring, signals, or inference here
  // This is purely the temporal structure layer
}

/**
 * MultiWindowSet
 * A collection of related windows for comparative analysis.
 * Deterministic and explicitly structured.
 */
export interface MultiWindowSet {
  setId: string;
  windows: MultiWindowTemporalContract[];
  relationships: WindowRelationship[];
  
  // Metadata about the set itself
  createdAt: number;      // Unix milliseconds
  purpose: SetPurpose;    // Explicit classification of set's purpose (no free-form text)
}

/**
 * TemporalValidationResult
 * Result of validating a window or window set against contracts.
 * For phase 1: structural validation only.
 */
export interface TemporalValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedAt: number;    // Unix milliseconds
}
