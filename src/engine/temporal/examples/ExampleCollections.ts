/**
 * Example Collections
 * Concrete examples of window collections and collection operations.
 * Demonstrates assembly, ordering, filtering, and structural validation.
 */

import type {
  TemporalWindowEntity,
  WindowSetMemberEntity,
} from "../entities/index.ts";
import type { AssembledWindowCollection } from "../operators/WindowCollectionOperator.ts";
import { WindowCollectionOperator } from "../operators/WindowCollectionOperator.ts";
import { ExampleEntities } from "./ExampleEntities.ts";

/**
 * Example window set members for collection assembly
 * Each member belongs to a window and carries explicit metadata.
 */
export class ExampleMembers {
  /**
   * Member belonging to primary reference window
   * Family: OBSERVATION, required
   * Joined: 2026-04-05T10:00:00Z
   */
  static readonly PRIMARY_WINDOW_MEMBER_1: WindowSetMemberEntity = {
    memberEntityId: "member-prim-001",
    windowId: "win-ref-001",
    position: 0,
    family: "OBSERVATION",
    isRequired: true,
    canBeSkipped: false,
    memberSince: 1744077600000,
  };

  /**
   * Member belonging to primary reference window
   * Family: BASELINE, required
   * Joined: 2026-04-05T10:00:01Z (1 second after member 1)
   */
  static readonly PRIMARY_WINDOW_MEMBER_2: WindowSetMemberEntity = {
    memberEntityId: "member-prim-002",
    windowId: "win-ref-001",
    position: 1,
    family: "BASELINE",
    isRequired: true,
    canBeSkipped: false,
    memberSince: 1744077600100,
  };

  /**
   * Member belonging to secondary comparison window
   * Family: REFERENCE, optional
   * Joined: 2026-04-05T10:15:00Z
   */
  static readonly SECONDARY_WINDOW_MEMBER_1: WindowSetMemberEntity = {
    memberEntityId: "member-sec-001",
    windowId: "win-comp-001",
    position: 0,
    family: "REFERENCE",
    isRequired: false,
    canBeSkipped: true,
    memberSince: 1744078500000,
  };

  /**
   * Member belonging to tertiary baseline window
   * Family: CONTROL, optional
   * Joined: 2026-04-05T10:30:00Z
   */
  static readonly TERTIARY_WINDOW_MEMBER_1: WindowSetMemberEntity = {
    memberEntityId: "member-tert-001",
    windowId: "win-baseline-001",
    position: 0,
    family: "CONTROL",
    isRequired: false,
    canBeSkipped: true,
    memberSince: 1744079400000,
  };

  /**
   * Get all example members
   * @returns Array of all example members
   */
  static getAllMembers(): WindowSetMemberEntity[] {
    return [
      this.PRIMARY_WINDOW_MEMBER_1,
      this.PRIMARY_WINDOW_MEMBER_2,
      this.SECONDARY_WINDOW_MEMBER_1,
      this.TERTIARY_WINDOW_MEMBER_1,
    ];
  }

  /**
   * Get members for a specific window
   * @param windowId - Window ID to filter by
   * @returns Array of members belonging to the window
   */
  static getMembersForWindow(windowId: string): WindowSetMemberEntity[] {
    return this.getAllMembers().filter(m => m.windowId === windowId);
  }

  /**
   * Get required members only
   * @returns Array of members with isRequired === true
   */
  static getRequiredMembers(): WindowSetMemberEntity[] {
    return this.getAllMembers().filter(m => m.isRequired);
  }
}

/**
 * Example window collections
 * Assembled collections with verified structure and ordering.
 */
export class ExampleCollections {
  /**
   * Basic collection: all three example windows with all members
   * Demonstrates: collection assembly, bidirectional validation
   */
  static getFullCollection(): AssembledWindowCollection {
    const windows = ExampleEntities.getAllEntities();
    const members = ExampleMembers.getAllMembers();

    const collection = WindowCollectionOperator.assembleCollection(
      "coll-full-001",
      windows,
      members,
      1744079400000  // assembledAt
    );

    // Validate structure
    WindowCollectionOperator.validateCollectionStructure(collection);

    return collection;
  }

  /**
   * Ordered collection: assembled and sorted by window start timestamp
   * Demonstrates: deterministic ordering by temporal boundaries
   */
  static getChronologicallyOrderedCollection(): AssembledWindowCollection {
    const windows = ExampleEntities.getAllEntities();
    const members = ExampleMembers.getAllMembers();

    // Order by temporal position (start time ascending)
    const ordered = WindowCollectionOperator.orderWindows(windows, {
      sortBy: "timestamp",
      timestampField: "start",
      direction: "asc",
    });

    const collection = WindowCollectionOperator.assembleCollection(
      "coll-chrono-001",
      ordered,
      members,
      1744079400000  // assembledAt
    );

    WindowCollectionOperator.validateCollectionStructure(collection);

    return collection;
  }

  /**
   * Filtered collection: only windows with required members
   * Demonstrates: explicit predicate filtering
   */
  static getRequiredMembersOnlyCollection(): AssembledWindowCollection {
    const allMembers = ExampleMembers.getAllMembers();
    const requiredMembers = allMembers.filter(m => m.isRequired);
    const windowIdsWithRequired = new Set(requiredMembers.map(m => m.windowId));
    const windows = ExampleEntities.getAllEntities().filter(w =>
      windowIdsWithRequired.has(w.contract.id)
    );

    const collection = WindowCollectionOperator.assembleCollection(
      "coll-required-001",
      windows,
      requiredMembers,
      1744079400000  // assembledAt
    );

    WindowCollectionOperator.validateCollectionStructure(collection);

    return collection;
  }

  /**
   * Primary-secondary collection: only primary and secondary windows
   * Demonstrates: explicit subset selection
   */
  static getPrimarySecondaryCollection(): AssembledWindowCollection {
    const windows = [
      ExampleEntities.PRIMARY_REFERENCE_WINDOW,
      ExampleEntities.SECONDARY_COMPARISON_WINDOW,
    ];

    const targetWindowIds = new Set(windows.map(w => w.contract.id));
    const members = ExampleMembers.getAllMembers().filter(m =>
      targetWindowIds.has(m.windowId)
    );

    const collection = WindowCollectionOperator.assembleCollection(
      "coll-primary-secondary-001",
      windows,
      members,
      1744079400000  // assembledAt
    );

    WindowCollectionOperator.validateCollectionStructure(collection);

    return collection;
  }

  /**
   * Verify collection metrics
   * @param collection - Collection to analyze
   * @returns Metrics object with statistics
   */
  static getCollectionMetrics(collection: AssembledWindowCollection): {
    windowCount: number;
    memberCount: number;
    avgMembersPerWindow: number;
    earliestStartTime: number;
    latestEndTime: number;
  } {
    const windowCount = collection.windows.length;
    const memberCount = collection.members.length;
    const avgMembersPerWindow = memberCount / windowCount;

    let earliestStartTime = Infinity;
    let latestEndTime = 0;

    for (const window of collection.windows) {
      earliestStartTime = Math.min(
        earliestStartTime,
        window.contract.boundary.startTimestamp
      );
      latestEndTime = Math.max(
        latestEndTime,
        window.contract.boundary.endTimestamp
      );
    }

    return {
      windowCount,
      memberCount,
      avgMembersPerWindow,
      earliestStartTime,
      latestEndTime,
    };
  }
}
