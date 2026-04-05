/**
 * Comparison Entity Models
 * Concrete structural representations for comparison-ready entities.
 * Derived from contract shapes but instantiated as discrete entities.
 * explicit data models, not processors.
 */

import type {
  ComparisonPair,
  ComparisonGroup,
  ComparisonMatrix,
  WindowSetMember,
} from "../contracts/index.ts";
import { ComparisonWindowRole, ComparisonPairType, ComparisonGroupType } from "../contracts/index.ts";

/**
 * ComparisonPairEntity
 * Concrete instantiation of a comparison pair.
 * Wraps the contract pair with entity-level tracking.
 */
export interface ComparisonPairEntity {
  entityId: string;              // Entity identity (distinct from pairId)
  pair: ComparisonPair;          // Canonical contract
  leftWindowId: string;          // Explicit reference to left window
  rightWindowId: string;         // Explicit reference to right window
  leftRole: ComparisonWindowRole;
  rightRole: ComparisonWindowRole;
  pairType: ComparisonPairType;
  instantiatedAt: number;        // When entity was created (Unix ms)
}

/**
 * ComparisonGroupEntity
 * Concrete instantiation of a comparison group.
 * Container for multiple pairs with group-level metadata.
 */
export interface ComparisonGroupEntity {
  entityId: string;              // Entity identity (distinct from groupId)
  group: ComparisonGroup;        // Canonical contract
  pairs: ComparisonPairEntity[];// Instantiated pairs in this group
  windowIds: string[];           // All unique window IDs involved
  groupType: ComparisonGroupType;
  instantiatedAt: number;        // When entity was created (Unix ms)
}

/**
 * ComparisonMatrixEntity
 * Concrete instantiation of a comparison matrix.
 * All-pairs representation for N-way comparisons.
 */
export interface ComparisonMatrixEntity {
  entityId: string;              // Entity identity (distinct from matrixId)
  matrix: ComparisonMatrix;      // Canonical contract
  windowIds: string[];           // All windows (rows/columns)
  pairIds: string[];             // All pairs in matrix
  matrixType: "full" | "upper_triangle" | "lower_triangle" | "sparse";
  pairCount: number;             // Count of pairs for quick reference
  instantiatedAt: number;        // When entity was created (Unix ms)
}

/**
 * WindowSetMemberEntity
 * Concrete instantiation of a window set member.
 * Tracks membership with position and family metadata.
 */
export interface WindowSetMemberEntity {
  memberEntityId: string;        // Entity identity
  windowId: string;              // Reference to canonical window
  position: number;              // 0-based index in collection
  family: "OBSERVATION" | "HISTORICAL" | "CONTROL" | "BASELINE" | "REFERENCE" | "TREND";
  isRequired: boolean;           // Whether window is required
  canBeSkipped: boolean;         // Whether window can be omitted
  memberSince: number;           // When membership was established (Unix ms)
}

/**
 * ComparisonSetAssembly
 * Explicit assembly of comparison-ready entities.
 * Groups pairs, groups, and matrices that share Windows.
 */
export interface ComparisonSetAssembly {
  assemblyId: string;
  
  // Constituent entities
  pairs: ComparisonPairEntity[];
  groups: ComparisonGroupEntity[];
  matrices: ComparisonMatrixEntity[];
  
  // Window set members
  members: WindowSetMemberEntity[];
  
  // Assembly metadata
  assembledAt: number;           // When assembly was created (Unix ms)
  windowCount: number;           // Count of unique windows
  pairCount: number;             // Count of pairs across all structures
}

/**
 * ComparisonReadyWindowSet
 * Complete set of windows prepared for comparison.
 * All windows have explicit membership, type, and relationship info.
 */
export interface ComparisonReadyWindowSet {
  setId: string;
  windowIds: string[];           // All windows in set
  members: WindowSetMemberEntity[];  // Member tracks with metadata
  comparison: ComparisonSetAssembly; // Paired/grouped comparison structure
  createdAt: number;             // When set was prepared (Unix ms)
}
