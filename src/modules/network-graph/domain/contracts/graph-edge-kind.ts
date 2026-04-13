/**
 * Graph Edge Kind
 * Enumeration of structural edge types connecting graph nodes.
 * Foundational vocabulary for edge classifications.
 * Domain-aligned with network graph relationships.
 */

export enum GraphEdgeKind {
  /** ForeignKey edge - represents ownership or hierarchical relationships */
  FOREIGN_KEY = "foreign_key",

  /** Belongs-to edge - represents belongingness or membership */
  BELONGS_TO = "belongs_to",

  /** Contains edge - represents composition or structural containment */
  CONTAINS = "contains",

  /** References edge - represents references or associations */
  REFERENCES = "references",

  /** Connects edge - represents connections or linkages */
  CONNECTS = "connects",

  /** Operates-in edge - represents operational scopes or domains */
  OPERATES_IN = "operates_in",

  /** Requires edge - represents prerequisites or dependencies */
  REQUIRES = "requires",

  /** Located-at edge - represents location or placement */
  LOCATED_AT = "located_at",
}
