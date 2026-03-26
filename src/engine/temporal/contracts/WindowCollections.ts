/**
 * Window Collections and Set Membership Models
 * Structural ordering and collection membership definitions.
 * Deterministic ordering metadata and set positioning.
 */

import type { WindowDescriptor } from "./WindowDescriptors.ts";
import type { MultiWindowTemporalContract } from "./CoreTemporalContracts.ts";

/**
 * OrderingType enum
 * Classification of collection ordering semantics.
 * Purely structural, no ordering logic implementation.
 */
export enum OrderingType {
  SEQUENTIAL = "SEQUENTIAL",       // Ordered by time, sequence, or provided order
  PARALLEL = "PARALLEL",           // No inherent ordering
  HIERARCHICAL = "HIERARCHICAL",   // Ordered by hierarchy level
  CUSTOM = "CUSTOM",               // Custom ordering scheme
}

/**
 * WindowSetMember
 * A window within a multi-window collection.
 * Includes position, family, and descriptor metadata for collection operations.
 * 
 * Does not duplicate window contract; references existing window by ID.
 */
export interface WindowSetMember {
  windowId: string;           // Reference to canonical MultiWindowTemporalContract.id
  
  // Position in collection
  position: number;           // 0-based index
  descriptor: WindowDescriptor;
  
  // Collection-specific metadata
  isRequired: boolean;        // Whether this window is required for valid comparison
  canBeSkipped: boolean;      // Whether collection can function without this window
}

/**
 * OrderingMetadata
 * Structural ordering information for a collection.
 * Declares how windows are ordered without implementing ordering logic.
 */
export interface OrderingMetadata {
  type: OrderingType;
  direction?: "ascending" | "descending" | "none";
  sortField?: string;                    // Field used for sorting if applicable
  customOrderIds?: string[];             // Explicit window IDs in order if custom
  tiebreaker?: "position_number" | "creation_time" | "id";
}

/**
 * OrderedWindowCollection
 * Collection of windows with explicit ordering structure.
 * Provides deterministic ordering metadata for later temporal chain processing.
 * 
 * Does not implement chain logic; purely defines the structure.
 */
export interface OrderedWindowCollection {
  collectionId: string;
  
  // Membership
  members: WindowSetMember[];
  
  // Ordering structure
  ordering: OrderingMetadata;
  
  // Metadata
  createdAt: number;                     // When collection was defined (Unix ms)
}

/**
 * WindowCollectionOperationPrep
 * Preparation structure for collection-level operations.
 * Defines which windows participate in which structural roles.
 * Does not specify what operation will use this preparation.
 */
export interface WindowCollectionOperationPrep {
  prepId: string;
  collectionId: string;
  
  // Partition windows by structural role
  primaryWindowIds: string[];            // Main windows
  supportingWindowIds?: string[];        // Supporting/auxiliary windows
  controlWindowIds?: string[];           // Control/baseline windows
  
  createdAt: number;                     // When prep was created (Unix ms)
}

/**
 * WindowSequenceBinding
 * Explicit binding for sequential window chains.
 * Allows deterministic ordering without implementing chain processing.
 */
export interface WindowSequenceBinding {
  bindingId: string;
  windowIds: string[];                   // Ordered sequence of window IDs
  sequenceType: "temporal" | "logical" | "custom";
  
  // Chain metadata
  precedenceExplicit: boolean;           // If true, order is strict prerequisite
  allowParallelProcessing: boolean;      // Even with sequence, can windows be processed in parallel?
  
  createdAt: number;                     // When binding was created (Unix ms)
}

/**
 * PartitionedWindowSet
 * Explicit partitioning of windows by role or category.
 * Deterministic grouping without requiring reallocation of window IDs.
 */
export interface PartitionedWindowSet {
  partitionId: string;
  collectionId: string;
  
  // Partition groups
  partitions: Record<string, string[]>;  // partitionName -> [windowIds]
  
  // Partition semantics
  partitionScheme: "by_role" | "by_family" | "by_period" | "by_comparison_function" | "custom";
  
  createdAt: number;                     // When partition was defined (Unix ms)
}
