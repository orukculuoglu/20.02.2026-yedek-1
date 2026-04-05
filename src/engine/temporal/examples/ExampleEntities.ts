/**
 * Example Entities
 * Concrete temporal window entities built using the builders layer.
 * All values are deterministic and explicitly defined.
 */

import type { TemporalWindowEntity } from "../entities/index.ts";
import type {
  TemporalWindowMetadata,
  TemporalWindowBoundary,
  TemporalComparisonContract,
  WindowTypeContract,
  WindowRelationship,
} from "../contracts/index.ts";
import {
  WindowType,
  WindowRole,
  ComparisonType,
  AlignmentType,
  TemporalGrain,
} from "../contracts/index.ts";
import { WindowBuilder } from "../builders/WindowBuilder.ts";
import { ExampleIdentities } from "./ExampleIdentities.ts";

/**
 * Example temporal window entities constructed via builders with explicit values.
 */
export class ExampleEntities {
  /**
   * Primary reference window entity
   * Type: REFERENCE, Role: PRIMARY
   * Time range: 2026-04-01 00:00:00Z to 2026-04-05 00:00:00Z
   * Created: 2026-04-05T10:00:00Z
   */
  static readonly PRIMARY_REFERENCE_WINDOW: TemporalWindowEntity =
    WindowBuilder.build(
      ExampleIdentities.PRIMARY_REFERENCE_IDENTITY,
      {
        id: "win-ref-001",
        metadata: {
          createdAt: 1744077600000,
          version: "1.0.0",
        } as TemporalWindowMetadata,
        boundary: {
          startTimestamp: 1743638400000,     // 2026-04-01T00:00:00Z
          endTimestamp: 1744077600000,       // 2026-04-05T00:00:00Z
        } as TemporalWindowBoundary,
        windowType: {
          type: WindowType.REFERENCE,
          role: WindowRole.PRIMARY,
        } as WindowTypeContract,
        comparison: {
          comparisonType: ComparisonType.ABSOLUTE,
          alignmentType: AlignmentType.ALIGNED,
          grain: TemporalGrain.DAY,
        } as TemporalComparisonContract,
        relationships: [] as WindowRelationship[],
      },
      1744077600000  // entityCreatedAt
    );

  /**
   * Secondary comparison window entity
   * Type: COMPARISON, Role: SECONDARY
   * Time range: 2026-04-02 00:00:00Z to 2026-04-08 00:00:00Z (extended)
   * Created: 2026-04-05T10:15:00Z
   */
  static readonly SECONDARY_COMPARISON_WINDOW: TemporalWindowEntity =
    WindowBuilder.build(
      ExampleIdentities.SECONDARY_COMPARISON_IDENTITY,
      {
        id: "win-comp-001",
        metadata: {
          createdAt: 1744078500000,
          version: "1.0.0",
        } as TemporalWindowMetadata,
        boundary: {
          startTimestamp: 1743724800000,     // 2026-04-02T00:00:00Z
          endTimestamp: 1744336800000,       // 2026-04-08T00:00:00Z
        } as TemporalWindowBoundary,
        windowType: {
          type: WindowType.COMPARISON,
          role: WindowRole.SECONDARY,
        } as WindowTypeContract,
        comparison: {
          comparisonType: ComparisonType.RELATIVE,
          alignmentType: AlignmentType.ALIGNED,
          grain: TemporalGrain.DAY,
        } as TemporalComparisonContract,
        relationships: [] as WindowRelationship[],
      },
      1744078500000  // entityCreatedAt
    );

  /**
   * Tertiary baseline window entity
   * Type: BASELINE, Role: CONTROL
   * Time range: 2026-03-25 00:00:00Z to 2026-04-10 00:00:00Z (widest)
   * Created: 2026-04-05T10:30:00Z
   */
  static readonly TERTIARY_BASELINE_WINDOW: TemporalWindowEntity =
    WindowBuilder.build(
      ExampleIdentities.TERTIARY_BASELINE_IDENTITY,
      {
        id: "win-baseline-001",
        metadata: {
          createdAt: 1744079400000,
          version: "1.0.0",
        } as TemporalWindowMetadata,
        boundary: {
          startTimestamp: 1743292800000,     // 2026-03-25T00:00:00Z
          endTimestamp: 1744510800000,       // 2026-04-10T00:00:00Z
        } as TemporalWindowBoundary,
        windowType: {
          type: WindowType.BASELINE,
          role: WindowRole.CONTROL,
        } as WindowTypeContract,
        comparison: {
          comparisonType: ComparisonType.DELTA,
          alignmentType: AlignmentType.ALIGNED,
          grain: TemporalGrain.DAY,
        } as TemporalComparisonContract,
        relationships: [] as WindowRelationship[],
      },
      1744079400000  // entityCreatedAt
    );

  /**
   * Validate entity structure
   * @param entity - Entity to validate
   * @returns true if entity is structurally valid, false otherwise
   */
  static isValid(entity: TemporalWindowEntity): boolean {
    return (
      !!entity &&
      !!entity.contract &&
      !!entity.contract.id &&
      !!entity.identity &&
      !!entity.contract.boundary &&
      entity.contract.boundary.startTimestamp < entity.contract.boundary.endTimestamp &&
      entity.entityCreatedAt >= 0
    );
  }

  /**
   * Get all example entities for batch verification
   * @returns Array of all example entities
   */
  static getAllEntities(): TemporalWindowEntity[] {
    return [
      this.PRIMARY_REFERENCE_WINDOW,
      this.SECONDARY_COMPARISON_WINDOW,
      this.TERTIARY_BASELINE_WINDOW,
    ];
  }

  /**
   * Get entities ordered by start timestamp (chronological)
   * @returns Array of entities ordered by boundary.startTimestamp ascending
   */
  static getEntitiesByStartTime(): TemporalWindowEntity[] {
    return this.getAllEntities().sort(
      (a, b) => a.contract.boundary.startTimestamp - b.contract.boundary.startTimestamp
    );
  }

  /**
   * Get entities ordered by creation time
   * @returns Array of entities ordered by entityCreatedAt ascending
   */
  static getEntitiesByCreatedTime(): TemporalWindowEntity[] {
    return this.getAllEntities().sort(
      (a, b) => a.entityCreatedAt - b.entityCreatedAt
    );
  }

  /**
   * Get time overlap information between two entities
   * @param e1 - First entity
   * @param e2 - Second entity
   * @returns Object with overlap metrics or null if no overlap
   */
  static getOverlapMetrics(
    e1: TemporalWindowEntity,
    e2: TemporalWindowEntity
  ): { overlapStartTimestamp: number; overlapEndTimestamp: number; overlapDays: number } | null {
    const overlapStartTimestamp = Math.max(
      e1.contract.boundary.startTimestamp,
      e2.contract.boundary.startTimestamp
    );
    const overlapEndTimestamp = Math.min(
      e1.contract.boundary.endTimestamp,
      e2.contract.boundary.endTimestamp
    );

    if (overlapStartTimestamp >= overlapEndTimestamp) {
      return null; // No overlap
    }

    const overlapDays = Math.round(
      (overlapEndTimestamp - overlapStartTimestamp) / (24 * 60 * 60 * 1000)
    );
    return { overlapStartTimestamp, overlapEndTimestamp, overlapDays };
  }
}
