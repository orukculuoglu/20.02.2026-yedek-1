/**
 * Graph Node Kind
 * Enumeration of structural node types in the network graph.
 * Foundational vocabulary for node classifications.
 * Domain-aligned with service, part, region, fleet graph structures.
 */

export enum GraphNodeKind {
  /** Service entity - represents maintenance or operational services */
  SERVICE = "service",

  /** Part entity - represents inventory parts and components */
  PART = "part",

  /** Region entity - represents geographic or operational regions */
  REGION = "region",

  /** Fleet entity - represents fleet or group classifications */
  FLEET = "fleet",

  /** Vehicle entity - represents vehicles or mobile assets */
  VEHICLE = "vehicle",

  /** Facility entity - represents fixed facilities, depots, or locations */
  FACILITY = "facility",

  /** Route entity - represents paths or route definitions */
  ROUTE = "route",

  /** Agent entity - represents human or system agents */
  AGENT = "agent",

  /** Resource entity - represents generic resources */
  RESOURCE = "resource",
}

