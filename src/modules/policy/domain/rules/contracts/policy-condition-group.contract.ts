import type { PolicyCondition } from "./policy-condition.contract.js";
import type { ConditionGrouping } from "./condition-grouping.enum.js";

/**
 * PolicyConditionGroup - Grouped conditions with logical composition mode
 * Pure structural definition with no traversal logic, evaluation state, or result semantics.
 * Supports recursive nesting of conditions and groups.
 *
 * Structurally enforced invariant: A group must contain at least one child surface.
 * An empty group is impossible at the type level.
 *
 * Valid structures:
 * - Variant 1: conditions required, nestedGroups optional (conditions only or both)
 * - Variant 2: nestedGroups required, conditions absent (nested groups only)
 */
export type PolicyConditionGroup =
  | {
      /**
       * Unique identifier for this group within its containing rule
       */
      readonly groupId: string;

      /**
       * Logical grouping mode for combining member conditions
       * ALL: all conditions must be satisfied
       * ANY: at least one condition must be satisfied
       * NONE: no conditions must be satisfied
       */
      readonly grouping: ConditionGrouping;

      /**
       * Atomic conditions that are members of this group
       * Required in this variant; optionally accompanied by nested groups
       */
      readonly conditions: ReadonlyArray<PolicyCondition>;

      /**
       * Nested condition groups for hierarchical/recursive composition
       * Optional in this variant; if omitted, only conditions define the group
       * Supports arbitrary nesting depth
       */
      readonly nestedGroups?: ReadonlyArray<PolicyConditionGroup>;
    }
  | {
      /**
       * Unique identifier for this group within its containing rule
       */
      readonly groupId: string;

      /**
       * Logical grouping mode for combining member conditions
       * ALL: all conditions must be satisfied
       * ANY: at least one condition must be satisfied
       * NONE: no conditions must be satisfied
       */
      readonly grouping: ConditionGrouping;

      /**
       * Nested condition groups for hierarchical/recursive composition
       * Required in this variant; defines the group structure when conditions are absent
       * Supports arbitrary nesting depth
       */
      readonly nestedGroups: ReadonlyArray<PolicyConditionGroup>;
    };
