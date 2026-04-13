/**
 * Graph Node Attributes
 * Optional minimal attribute specification for graph nodes.
 * Caller may optionally provide node-specific attributes.
 * No defaults, no validation logic, pure structural specification.
 */

/**
 * GraphNodeAttributes
 * Optional attributes that may be attached to a graph node.
 * Caller must explicitly provide any desired attributes.
 */
export interface GraphNodeAttributes {
  /** Optional domain entity identifier for cross-reference (caller-provided) */
  domainEntityId?: string;
}
