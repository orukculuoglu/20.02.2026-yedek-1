/**
 * Comparison Entity Models
 * Structural bindings for window comparison preparation.
 * Deterministic pairing and grouping for later analysis.
 */

/**
 * ComparisonWindowRole enum
 * Explicit role assignment for windows in comparison relationships.
 */
export enum ComparisonWindowRole {
  SOURCE = "SOURCE",           // Original/starting window
  TARGET = "TARGET",           // End/destination window
  BASELINE = "BASELINE",       // Comparison baseline
  OBSERVATION = "OBSERVATION", // Window being observed
  REFERENCE = "REFERENCE",     // Reference anchor
  CONTROL = "CONTROL",         // Unaffected control
}

/**
 * ComparisonPairType enum
 * Structural type classification for comparison pairs.
 * No interpretation, purely structural.
 */
export enum ComparisonPairType {
  REFERENCE_COMPARISON = "REFERENCE_COMPARISON",  // Window vs reference
  BASELINE_COMPARISON = "BASELINE_COMPARISON",    // Observation vs baseline
  TREND_PAIR = "TREND_PAIR",                      // Sequential windows
  CONTROL_COMPARISON = "CONTROL_COMPARISON",      // Treatment vs control
  SNAPSHOT_PAIR = "SNAPSHOT_PAIR",                // Point-in-time windows
}

/**
 * ComparisonPair
 * Explicit binding of two windows for later comparison.
 * Identifies left/right (or source/target) semantics clearly.
 * No comparison logic, purely preparatory structure.
 */
export interface ComparisonPair {
  pairId: string;
  
  // Window references
  leftWindowId: string;         // Canonical ID of left window
  rightWindowId: string;        // Canonical ID of right window
  
  // Role semantics
  leftRole: ComparisonWindowRole;
  rightRole: ComparisonWindowRole;
  
  // Type classification
  pairType: ComparisonPairType;
  
  // Metadata
  createdAt: number;            // When pair was defined (Unix ms)
  sequence?: number;            // Position in ordered comparison sequence
}

/**
 * ComparisonGroupType enum
 * Classification of comparison group structure.
 */
export enum ComparisonGroupType {
  PAIRWISE = "PAIRWISE",           // Group of independent pairs
  ONE_VS_MANY = "ONE_VS_MANY",     // One reference vs multiple
  MANY_VS_ONE = "MANY_VS_ONE",     // Multiple vs one reference
  MULTI_WAY = "MULTI_WAY",         // Complex multi-window comparison
  SEQUENTIAL = "SEQUENTIAL",       // Ordered sequence for chains
}

/**
 * ComparisonGroup
 * Explicit grouping of multiple comparison pairs or windows.
 * Grouping logic is declarative, not inferred.
 */
export interface ComparisonGroup {
  groupId: string;
  
  // Group composition
  pairs: ComparisonPair[];
  windowIds: string[];            // All windows involved
  
  // Group structure type
  groupType: ComparisonGroupType;
  
  // Group metadata
  createdAt: number;              // When group was defined (Unix ms)
}

/**
 * ComparisonMatrix
 * Explicit all-pairs or all-relationships mapping for multiple windows.
 * For N-way comparisons without sequential ordering.
 */
export interface ComparisonMatrix {
  matrixId: string;
  windowIds: string[];            // All windows (rows/columns)
  pairIds: string[];              // All comparison pairs in matrix
  matrixType: "full" | "upper_triangle" | "lower_triangle" | "sparse";
  createdAt: number;              // When matrix was defined (Unix ms)
}
