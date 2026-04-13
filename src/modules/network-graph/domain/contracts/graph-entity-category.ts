/**
 * Graph Entity Category
 * Enumeration of entity categorization for graph entities.
 * Foundational vocabulary for entity classification.
 * Domain-aligned with operational, geographic, participant scopes.
 */

export enum GraphEntityCategory {
  /** Operational category - main business entities (services, parts, fleets, vehicles) */
  OPERATIONAL = "operational",

  /** Geographic category - location-centric entities (regions, facilities, stops) */
  GEOGRAPHIC = "geographic",

  /** Participant category - actors and agents (drivers, mechanics, agents) */
  PARTICIPANT = "participant",

  /** Ephemeral category - dynamically created transient entities (routes, assignments) */
  EPHEMERAL = "ephemeral",
}
