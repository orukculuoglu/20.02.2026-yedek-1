/**
 * Fleet Routing Bridge Runtime Input
 * 
 * Defines the runtime input structure for the routing bridge.
 * 
 * The bridge converts eligible service routing candidates into
 * actual internal routing requests.
 */

import { FleetIntakeServiceRoutingCandidate } from '../contracts';

/**
 * FleetRoutingBridgeRuntimeInput
 * 
 * Complete runtime input for the routing bridge.
 * 
 * Determinism principles:
 * - All IDs are caller-provided
 * - All timestamps are caller-provided (ISO 8601 strings)
 * - No internal generation of IDs or timestamps
 * - Bridge is pure transformation only
 */
export interface FleetRoutingBridgeRuntimeInput {
  /**
   * The service routing candidate from evaluator.
   * 
   * Must have status of "candidate" to be promotable.
   * Bridge will not mutate this object.
   */
  candidate: FleetIntakeServiceRoutingCandidate;
  
  /**
   * Pre-allocated unique ID for the routing request.
   * 
   * Provided by caller to maintain determinism.
   * Used as-is in returned FleetServiceRoutingRequest if promotion succeeds.
   * 
   * Must be non-empty string.
   */
  routingId: string;
  
  /**
   * When this routing request was created.
   * 
   * Format: ISO 8601 string (e.g., "2026-06-06T10:30:00Z")
   * Provided by caller.
   * 
   * Must be non-empty string.
   */
  createdAt: string;
}
