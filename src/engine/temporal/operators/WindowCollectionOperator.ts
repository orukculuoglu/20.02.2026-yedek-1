/**
 * Window Collection Operator
 * Deterministic collection transformation and ordering utilities.
 * No semantic interpretation beyond structural composition.
 * No heuristics, no defaults, no inferred metadata.
 */

import type {
  TemporalWindowEntity,
  WindowSetMemberEntity,
} from "../entities/index.ts";

/**
 * OrderingCriteria
 * Explicit specification for how to order windows in a collection.
 * Caller must provide complete ordering rules.
 */
export interface OrderingCriteria {
  /**
   * sortBy: Field to sort windows by
   * - position: 0-based index order (as provided in input array)
   * - timestamp: start or end timestamp from boundary
   */
  sortBy: "position" | "timestamp";
  
  /**
   * direction: Sort direction
   * - asc: ascending order
   * - desc: descending order
   */
  direction: "asc" | "desc";
  
  /**
   * timestampField: Which boundary field to use if sortBy is "timestamp"
   * Required if sortBy === "timestamp"
   */
  timestampField?: "start" | "end";
}

/**
 * AssembledWindowCollection
 * Result of assembling explicit windows into an ordered collection.
 * All metadata is carried forward; nothing is inferred.
 */
export interface AssembledWindowCollection {
  collectionId: string;
  windows: TemporalWindowEntity[];
  members: WindowSetMemberEntity[];
  assembledAt: number;           // When collection was assembled (Unix ms)
}

/**
 * WindowCollectionOperator
 * Transforms explicit window collections deterministically.
 * Operates only on provided inputs; invents no metadata.
 */
export class WindowCollectionOperator {
  /**
   * orderWindows
   * Deterministically order a collection of windows by explicit criteria.
   * 
   * @param windows - Windows to order (must be non-empty)
   * @param criteria - Explicit ordering specification
   * @returns Ordered array of windows in specified order
   */
  static orderWindows(
    windows: TemporalWindowEntity[],
    criteria: OrderingCriteria
  ): TemporalWindowEntity[] {
    // Validate inputs
    if (!Array.isArray(windows)) {
      throw new Error("WindowCollectionOperator.orderWindows: windows must be an array");
    }
    if (windows.length === 0) {
      throw new Error("WindowCollectionOperator.orderWindows: windows array must be non-empty");
    }
    for (let i = 0; i < windows.length; i++) {
      if (!windows[i] || !windows[i].contract) {
        throw new Error(`WindowCollectionOperator.orderWindows: windows[${i}] is invalid`);
      }
    }

    if (!criteria) {
      throw new Error("WindowCollectionOperator.orderWindows: criteria is required");
    }
    if (!criteria.sortBy) {
      throw new Error("WindowCollectionOperator.orderWindows: criteria.sortBy is required");
    }

    // Validate sortBy choice
    if (criteria.sortBy !== "position" && criteria.sortBy !== "timestamp") {
      throw new Error(
        `WindowCollectionOperator.orderWindows: criteria.sortBy must be "position" or "timestamp"`
      );
    }

    // Validate direction
    if (!criteria.direction || !["asc", "desc"].includes(criteria.direction)) {
      throw new Error(
        `WindowCollectionOperator.orderWindows: criteria.direction must be "asc" or "desc"`
      );
    }

    // For timestamp sorting, require timestampField
    if (criteria.sortBy === "timestamp") {
      if (!criteria.timestampField || !["start", "end"].includes(criteria.timestampField)) {
        throw new Error(
          `WindowCollectionOperator.orderWindows: criteria.timestampField must be "start" or "end" when sortBy is "timestamp"`
        );
      }
    }

    // Create shallow copy to avoid mutation
    const ordered = [...windows];

    // Apply ordering
    if (criteria.sortBy === "position") {
      // Position sorting: sort by original position in array
      ordered.sort((a, b) => {
        const aIndex = windows.indexOf(a);
        const bIndex = windows.indexOf(b);
        return criteria.direction === "asc" ? aIndex - bIndex : bIndex - aIndex;
      });
    } else if (criteria.sortBy === "timestamp") {
      // Timestamp sorting
      const field = criteria.timestampField as "start" | "end";
      ordered.sort((a, b) => {
        const aTime = a.contract.boundary[field];
        const bTime = b.contract.boundary[field];
        
        if (typeof aTime !== "number" || typeof bTime !== "number") {
          throw new Error(
            `WindowCollectionOperator.orderWindows: window with invalid boundary.${field}`
          );
        }
        
        return criteria.direction === "asc" ? aTime - bTime : bTime - aTime;
      });
    }

    return ordered;
  }

  /**
   * assembleCollection
   * Assemble explicit windows and members into a structured collection.
   * No metadata inference; all structure must be provided explicitly.
   * 
   * @param collectionId - Unique collection identifier
   * @param windows - Windows to include in collection
   * @param members - Window set members with metadata
   * @param assembledAt - Timestamp when collection was assembled (Unix ms)
   * @returns Assembled collection with all provided structure intact
   */
  static assembleCollection(
    collectionId: string,
    windows: TemporalWindowEntity[],
    members: WindowSetMemberEntity[],
    assembledAt: number
  ): AssembledWindowCollection {
    // Validate collection ID
    if (!collectionId || typeof collectionId !== "string") {
      throw new Error("WindowCollectionOperator.assembleCollection: collectionId must be a non-empty string");
    }

    // Validate windows array
    if (!Array.isArray(windows)) {
      throw new Error("WindowCollectionOperator.assembleCollection: windows must be an array");
    }
    if (windows.length === 0) {
      throw new Error("WindowCollectionOperator.assembleCollection: windows must be non-empty");
    }
    for (let i = 0; i < windows.length; i++) {
      if (!windows[i] || !windows[i].contract) {
        throw new Error(`WindowCollectionOperator.assembleCollection: windows[${i}] is invalid`);
      }
    }

    // Validate members array
    if (!Array.isArray(members)) {
      throw new Error("WindowCollectionOperator.assembleCollection: members must be an array");
    }
    if (members.length === 0) {
      throw new Error("WindowCollectionOperator.assembleCollection: members must be non-empty");
    }
    for (let i = 0; i < members.length; i++) {
      if (!members[i] || !members[i].memberEntityId) {
        throw new Error(`WindowCollectionOperator.assembleCollection: members[${i}] is invalid`);
      }
    }

    // Validate timestamp
    if (typeof assembledAt !== "number" || assembledAt < 0) {
      throw new Error("WindowCollectionOperator.assembleCollection: assembledAt must be a non-negative number");
    }

    // Validate structural consistency: all window IDs in members should be in windows
    const windowIdSet = new Set(windows.map(w => w.contract.id));
    for (let i = 0; i < members.length; i++) {
      const memberId = members[i].windowId;
      if (!windowIdSet.has(memberId)) {
        throw new Error(
          `WindowCollectionOperator.assembleCollection: members[${i}].windowId "${memberId}" not found in windows collection`
        );
      }
    }

    return {
      collectionId,
      windows,
      members,
      assembledAt,
    };
  }

  /**
   * validateCollectionStructure
   * Verify that a collection's windows and members are structurally consistent.
   * 
   * @param collection - Collection to validate
   * @returns true if structure is valid; throws if not
   */
  static validateCollectionStructure(collection: AssembledWindowCollection): boolean {
    if (!collection) {
      throw new Error("WindowCollectionOperator.validateCollectionStructure: collection is required");
    }

    // Verify all members reference windows in the collection
    const windowIds = new Set(collection.windows.map(w => w.contract.id));
    
    for (let i = 0; i < collection.members.length; i++) {
      const member = collection.members[i];
      if (!windowIds.has(member.windowId)) {
        throw new Error(
          `WindowCollectionOperator.validateCollectionStructure: members[${i}].windowId "${member.windowId}" not in windows collection`
        );
      }
    }

    // Verify all windows are referenced by at least one member
    const memberedWindowIds = new Set(collection.members.map(m => m.windowId));
    for (const windowId of windowIds) {
      if (!memberedWindowIds.has(windowId)) {
        throw new Error(
          `WindowCollectionOperator.validateCollectionStructure: window "${windowId}" has no corresponding member`
        );
      }
    }

    return true;
  }

  /**
   * filterByMembership
   * Deterministically filter windows from a collection based on explicit membership criteria.
   * 
   * @param collection - Source collection
   * @param memberFilter - Explicit filter predicate on WindowSetMemberEntity
   * @returns New collection containing only filtered windows and members
   */
  static filterByMembership(
    collection: AssembledWindowCollection,
    memberFilter: (member: WindowSetMemberEntity) => boolean
  ): AssembledWindowCollection {
    if (!collection) {
      throw new Error("WindowCollectionOperator.filterByMembership: collection is required");
    }
    if (typeof memberFilter !== "function") {
      throw new Error("WindowCollectionOperator.filterByMembership: memberFilter must be a function");
    }

    // Apply filter to members
    const filteredMembers = collection.members.filter(memberFilter);
    
    if (filteredMembers.length === 0) {
      throw new Error("WindowCollectionOperator.filterByMembership: filter resulted in empty member set");
    }

    // Find corresponding windows
    const filteredWindowIds = new Set(filteredMembers.map(m => m.windowId));
    const filteredWindows = collection.windows.filter(w => filteredWindowIds.has(w.contract.id));

    if (filteredWindows.length === 0) {
      throw new Error("WindowCollectionOperator.filterByMembership: filter resulted in empty window set");
    }

    return {
      collectionId: collection.collectionId,
      windows: filteredWindows,
      members: filteredMembers,
      assembledAt: collection.assembledAt,
    };
  }
}
