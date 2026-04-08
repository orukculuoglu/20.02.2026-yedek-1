/**
 * Trend Chain Runtime
 * Deterministic orchestration of trend chain evaluation.
 * Validates members, links, and assembles complete trend chain surface.
 * All computation synchronous and deterministic from explicit caller-provided inputs only.
 * No ID generation, no business logic, no interpretation.
 */

import { TrendChainInputContext, TrendChainContextValidator, TrendChainMember, TrendChainLink } from "./TrendChainContext.ts";
import { TrendChainSurface, TrendChainResult, TrendChainResultBuilder } from "./TrendChainResult.ts";

/**
 * TrendChainRuntime
 * Deterministic evaluation of trend chains from explicit runtime context.
 * Synchronous, no async operations, no random, no Date.now().
 */
export class TrendChainRuntime {
  /**
   * validateMemberOrdering
   * Strict validation that members have unique, non-negative chainPositions.
   * Validates uniqueness and non-negativity, then deterministically sorts by position.
   * Does not enforce contiguity; gaps in position sequence are permitted.
   * Throws on duplicate positions or invalid types.
   *
   * @param members - Chain members to validate
   * @returns Ordered members sorted by chainPosition for deterministic output
   * @throws Error if positions invalid (non-negative, non-unique)
   */
  static validateMemberOrdering(members: TrendChainMember[]): TrendChainMember[] {
    if (!Array.isArray(members) || members.length === 0) {
      throw new Error("TrendChainRuntime.validateMemberOrdering: members must be non-empty array");
    }

    const positions = new Map<number, TrendChainMember>();
    const seenPositions = new Set<number>();

    for (const member of members) {
      if (typeof member.chainPosition !== "number") {
        throw new Error("TrendChainRuntime.validateMemberOrdering: member.chainPosition must be a number");
      }
      if (member.chainPosition < 0) {
        throw new Error("TrendChainRuntime.validateMemberOrdering: member.chainPosition must be non-negative");
      }
      if (seenPositions.has(member.chainPosition)) {
        throw new Error(
          `TrendChainRuntime.validateMemberOrdering: duplicate chainPosition ${member.chainPosition}`
        );
      }
      seenPositions.add(member.chainPosition);
      positions.set(member.chainPosition, member);
    }

    // Sort by position for deterministic ordering
    const sortedPositions = Array.from(positions.keys()).sort((a, b) => a - b);
    const orderedMembers = sortedPositions.map((pos) => positions.get(pos)!);

    return orderedMembers;
  }

  /**
   * validateFirstLast
   * Validate that firstTrendId matches first ordered member and lastTrendId matches last.
   * Throws if mismatch detected.
   *
   * @param members - Ordered members (must be sorted)
   * @param firstTrendId - Expected first trend ID
   * @param lastTrendId - Expected last trend ID
   * @throws Error if first/last don't match
   */
  static validateFirstLast(members: TrendChainMember[], firstTrendId: string, lastTrendId: string): void {
    if (members.length === 0) {
      throw new Error("TrendChainRuntime.validateFirstLast: members array is empty");
    }

    const actualFirstTrendId = members[0].trendId;
    const actualLastTrendId = members[members.length - 1].trendId;

    if (firstTrendId !== actualFirstTrendId) {
      throw new Error(
        `TrendChainRuntime.validateFirstLast: firstTrendId mismatch. Expected ${firstTrendId}, got ${actualFirstTrendId}`
      );
    }

    if (lastTrendId !== actualLastTrendId) {
      throw new Error(
        `TrendChainRuntime.validateFirstLast: lastTrendId mismatch. Expected ${lastTrendId}, got ${actualLastTrendId}`
      );
    }
  }

  /**
   * validateLinks
   * Validate that all links reference existing members and have valid structure.
   * Returns only valid links.
   * Invalid links are collected as readiness errors.
   *
   * @param links - Links to validate
   * @param members - Chain members
   * @param readinessErrors - Array to collect validation errors
   * @returns Array of validated links
   */
  static validateLinks(
    links: TrendChainLink[],
    members: TrendChainMember[],
    readinessErrors: string[]
  ): TrendChainLink[] {
    if (!Array.isArray(links)) {
      return [];
    }

    const memberIds = new Set(members.map((m) => m.chainMemberId));
    const trendIds = new Map(members.map((m) => [m.chainMemberId, m.trendId]));
    const validatedLinks: TrendChainLink[] = [];

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const linkErrors: string[] = [];

      // Validate source member exists
      if (!memberIds.has(link.sourceMemberId)) {
        linkErrors.push(`links[${i}]: sourceMemberId ${link.sourceMemberId} does not exist in members`);
      } else {
        // Validate source trend ID matches
        const expectedSourceTrendId = trendIds.get(link.sourceMemberId);
        if (link.sourceTrendId !== expectedSourceTrendId) {
          linkErrors.push(
            `links[${i}]: sourceTrendId ${link.sourceTrendId} does not match member ${link.sourceMemberId} trendId ${expectedSourceTrendId}`
          );
        }
      }

      // Validate target member exists
      if (!memberIds.has(link.targetMemberId)) {
        linkErrors.push(`links[${i}]: targetMemberId ${link.targetMemberId} does not exist in members`);
      } else {
        // Validate target trend ID matches
        const expectedTargetTrendId = trendIds.get(link.targetMemberId);
        if (link.targetTrendId !== expectedTargetTrendId) {
          linkErrors.push(
            `links[${i}]: targetTrendId ${link.targetTrendId} does not match member ${link.targetMemberId} trendId ${expectedTargetTrendId}`
          );
        }
      }

      if (linkErrors.length === 0) {
        validatedLinks.push(link);
      } else {
        readinessErrors.push(...linkErrors);
      }
    }

    return validatedLinks;
  }

  /**
   * evaluate
   * Complete deterministic trend chain evaluation.
   * Validates members, links, first/last identifiers.
   * Assembles complete trend chain surface from components.
   *
   * @param context - Explicit trend chain context with caller-provided inputs
   * @returns Complete trend chain result
   */
  static evaluate(context: TrendChainInputContext): TrendChainResult {
    // Validate context using strict validator
    TrendChainContextValidator.validateStrict(context);

    const readinessErrors: string[] = [];

    // Step 1: Validate and order members by chainPosition
    let orderedMembers: TrendChainMember[];
    try {
      orderedMembers = this.validateMemberOrdering(context.members);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      readinessErrors.push(errorMsg);
      // Return early if member ordering fails
      const invalidResult = TrendChainResultBuilder.build(
        context.chainRuntimeId,
        context.chainSessionId,
        context.chainStartedAt,
        context.chainCompletedAt,
        {
          trendChainId: context.trendChainId,
          chainType: context.chainType,
          members: [],
          validatedLinks: [],
          firstTrendId: context.firstTrendId,
          lastTrendId: context.lastTrendId,
          chainLength: 0,
          evaluatedAt: context.chainCompletedAt,
          metadata: context.metadata,
        },
        [],
        readinessErrors,
        context.metadata
      );
      return invalidResult;
    }

    // Step 2: Validate first/last trend identifiers match ordered members
    try {
      this.validateFirstLast(orderedMembers, context.firstTrendId, context.lastTrendId);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      readinessErrors.push(errorMsg);
    }

    // Step 3: Validate links and collect valid ones
    const validatedLinks = this.validateLinks(context.links, orderedMembers, readinessErrors);

    // Step 4: Assemble trend chain surface
    const trendChainSurface: TrendChainSurface = {
      trendChainId: context.trendChainId,
      chainType: context.chainType,
      members: orderedMembers,
      validatedLinks,
      firstTrendId: context.firstTrendId,
      lastTrendId: context.lastTrendId,
      chainLength: orderedMembers.length,
      evaluatedAt: context.chainCompletedAt,
      metadata: context.metadata,
    };

    // Step 5: Build and return result with preserved runtime-collected errors
    return TrendChainResultBuilder.build(
      context.chainRuntimeId,
      context.chainSessionId,
      context.chainStartedAt,
      context.chainCompletedAt,
      trendChainSurface,
      validatedLinks,
      readinessErrors,
      context.metadata
    );
  }
}
