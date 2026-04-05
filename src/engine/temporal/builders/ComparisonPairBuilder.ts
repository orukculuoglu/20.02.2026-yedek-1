/**
 * Comparison Pair Builder
 * Deterministic construction of comparison pairs and pair entities.
 * Requires explicit inputs. No analytical interpretation.
 */

import type {
  ComparisonPair,
  ComparisonWindowRole,
  ComparisonPairType,
} from "../contracts/index.ts";
import type { ComparisonPairEntity } from "../entities/index.ts";

/**
 * ComparisonPairBuilder
 * Constructs ComparisonPair contracts from fully explicit specifications.
 * 
 * No inference of semantics. All fields must be provided.
 * Enforces structural validity only.
 */
export class ComparisonPairBuilder {
  /**
   * build
   * Construct a ComparisonPair contract from explicit components.
   * 
   * @param pairId - Unique identifier (no generation, must be provided)
   * @param leftWindowId - Left window reference (must be non-empty)
   * @param rightWindowId - Right window reference (must be non-empty)
   * @param leftRole - Role of left window in comparison
   * @param rightRole - Role of right window in comparison
   * @param pairType - Classification of pair type
   * @param createdAt - Timestamp of pair definition (Unix ms)
   * @param sequence - Optional sequence position (must be >= 0 if provided)
   * @returns Fully constructed ComparisonPair
   */
  static build(
    pairId: string,
    leftWindowId: string,
    rightWindowId: string,
    leftRole: ComparisonWindowRole,
    rightRole: ComparisonWindowRole,
    pairType: ComparisonPairType,
    createdAt: number,
    sequence?: number
  ): ComparisonPair {
    // Validate pair ID
    if (!pairId || typeof pairId !== "string") {
      throw new Error("ComparisonPairBuilder.build: pairId must be a non-empty string");
    }

    // Validate window IDs
    if (!leftWindowId || typeof leftWindowId !== "string") {
      throw new Error("ComparisonPairBuilder.build: leftWindowId must be a non-empty string");
    }
    if (!rightWindowId || typeof rightWindowId !== "string") {
      throw new Error("ComparisonPairBuilder.build: rightWindowId must be a non-empty string");
    }

    // Validate roles exist
    if (!leftRole || typeof leftRole !== "string") {
      throw new Error("ComparisonPairBuilder.build: leftRole must be a string");
    }
    if (!rightRole || typeof rightRole !== "string") {
      throw new Error("ComparisonPairBuilder.build: rightRole must be a string");
    }

    // Validate pair type
    if (!pairType || typeof pairType !== "string") {
      throw new Error("ComparisonPairBuilder.build: pairType must be a string");
    }

    // Validate timestamp
    if (typeof createdAt !== "number" || createdAt < 0) {
      throw new Error("ComparisonPairBuilder.build: createdAt must be a non-negative number");
    }

    // Validate optional sequence
    if (sequence !== undefined) {
      if (typeof sequence !== "number" || sequence < 0) {
        throw new Error("ComparisonPairBuilder.build: sequence must be a non-negative number if provided");
      }
    }

    // Build pair
    const pair: ComparisonPair = {
      pairId,
      leftWindowId,
      rightWindowId,
      leftRole,
      rightRole,
      pairType,
      createdAt,
    };

    // Add optional sequence if provided
    if (sequence !== undefined) {
      pair.sequence = sequence;
    }

    return pair;
  }

  /**
   * buildWithValidation
   * Build a pair with explicit structural consistency checks.
   * Ensures windows are distinct (structural validity).
   * 
   * @param pairId - Unique identifier
   * @param leftWindowId - Left window ID
   * @param rightWindowId - Right window ID
   * @param leftRole - Left role
   * @param rightRole - Right role
   * @param pairType - Pair type
   * @param createdAt - Creation timestamp
   * @param sequence - Optional sequence position
   * @returns Fully constructed and validated ComparisonPair
   */
  static buildWithValidation(
    pairId: string,
    leftWindowId: string,
    rightWindowId: string,
    leftRole: ComparisonWindowRole,
    rightRole: ComparisonWindowRole,
    pairType: ComparisonPairType,
    createdAt: number,
    sequence?: number
  ): ComparisonPair {
    // Build with standard validation
    const pair = this.build(
      pairId,
      leftWindowId,
      rightWindowId,
      leftRole,
      rightRole,
      pairType,
      createdAt,
      sequence
    );

    // Additional structural check: windows must be distinct
    if (pair.leftWindowId === pair.rightWindowId) {
      throw new Error(
        "ComparisonPairBuilder.buildWithValidation: leftWindowId and rightWindowId must be distinct"
      );
    }

    return pair;
  }
}

/**
 * ComparisonPairEntityBuilder
 * Constructs ComparisonPairEntity (decorated pair) from explicit components.
 */
export class ComparisonPairEntityBuilder {
  /**
   * build
   * Construct a ComparisonPairEntity from pair and entity metadata.
   * 
   * @param entityId - Entity identity (no generation)
   * @param pair - ComparisonPair contract
   * @param leftWindowId - Explicit left window reference
   * @param rightWindowId - Explicit right window reference
   * @param leftRole - Left window role
   * @param rightRole - Right window role
   * @param pairType - Pair type
   * @param instantiatedAt - Entity instantiation timestamp
   * @returns Fully constructed ComparisonPairEntity
   */
  static build(
    entityId: string,
    pair: ComparisonPair,
    leftWindowId: string,
    rightWindowId: string,
    leftRole: ComparisonWindowRole,
    rightRole: ComparisonWindowRole,
    pairType: ComparisonPairType,
    instantiatedAt: number
  ): ComparisonPairEntity {
    // Validate entity ID
    if (!entityId || typeof entityId !== "string") {
      throw new Error("ComparisonPairEntityBuilder.build: entityId must be a non-empty string");
    }

    // Validate pair
    if (!pair) {
      throw new Error("ComparisonPairEntityBuilder.build: pair is required");
    }

    // Validate window IDs
    if (!leftWindowId || typeof leftWindowId !== "string") {
      throw new Error("ComparisonPairEntityBuilder.build: leftWindowId must be a non-empty string");
    }
    if (!rightWindowId || typeof rightWindowId !== "string") {
      throw new Error("ComparisonPairEntityBuilder.build: rightWindowId must be a non-empty string");
    }

    // Validate roles
    if (!leftRole || typeof leftRole !== "string") {
      throw new Error("ComparisonPairEntityBuilder.build: leftRole must be a string");
    }
    if (!rightRole || typeof rightRole !== "string") {
      throw new Error("ComparisonPairEntityBuilder.build: rightRole must be a string");
    }

    // Validate pair type
    if (!pairType || typeof pairType !== "string") {
      throw new Error("ComparisonPairEntityBuilder.build: pairType must be a string");
    }

    // Validate timestamp
    if (typeof instantiatedAt !== "number" || instantiatedAt < 0) {
      throw new Error("ComparisonPairEntityBuilder.build: instantiatedAt must be a non-negative number");
    }

    return {
      entityId,
      pair,
      leftWindowId,
      rightWindowId,
      leftRole,
      rightRole,
      pairType,
      instantiatedAt,
    };
  }

  /**
   * buildFromPair
   * Convenience method: build entity from a ComparisonPair, extracting its fields.
   * 
   * @param entityId - Entity identity
   * @param pair - Pre-constructed ComparisonPair
   * @param instantiatedAt - Entity instantiation timestamp
   * @returns Fully constructed ComparisonPairEntity
   */
  static buildFromPair(
    entityId: string,
    pair: ComparisonPair,
    instantiatedAt: number
  ): ComparisonPairEntity {
    return this.build(
      entityId,
      pair,
      pair.leftWindowId,
      pair.rightWindowId,
      pair.leftRole,
      pair.rightRole,
      pair.pairType,
      instantiatedAt
    );
  }
}
