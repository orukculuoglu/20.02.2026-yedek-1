/**
 * Network Event Type Contracts
 *
 * Motor 3: Market / Network Intelligence Engine
 * Layer 1: Network Data Aggregation
 * Phase 1: Network Event Types
 *
 * Purpose:
 * Defines strict type-level contracts for network events representing
 * deterministic operational data entering Motor 3 from Motor 2 (Dispatch Engine)
 * and external ecosystem reference binding.
 *
 * Scope:
 * - Type-level contracts only
 * - No logic
 * - No transformation
 * - No normalization logic
 * - No orchestration
 * - No runtime behavior
 * - No service layer
 * - No entity construction
 *
 * Design Principles:
 * - Deterministic contract structure
 * - Strict typing throughout
 * - Enterprise-grade naming
 * - No implicit defaults
 * - Transport-only rawContext
 * - Readonly-compatible design
 * - Reference-based architecture
 * - No object coupling
 * - No hidden dependencies
 *
 * Constraints:
 * - No Date.now()
 * - No ID generation
 * - No randomness
 * - No mutation
 * - No side effects
 * - No hidden defaults
 */

/**
 * Network Domain Enum
 *
 * Represents the operational domain within the network for which an event applies.
 *
 * Domains:
 * - SERVICE: Service network operations (dispatch, execution, delivery)
 * - PART: Part and component network operations (inventory, supply, stock)
 * - FLEET: Vehicle fleet network operations (routing, assignment, tracking)
 * - REGION: Geographic region network operations (zoning, coverage, assignment)
 */
export enum NetworkDomain {
  SERVICE = 'SERVICE',
  PART = 'PART',
  FLEET = 'FLEET',
  REGION = 'REGION',
}

/**
 * Network Event Source Kind Enum
 *
 * Represents the originating system that produced the network event.
 *
 * Sources:
 * - DISPATCH: Event originating from Motor 2 Dispatch Engine execution
 * - BEHAVIOR: Event originating from Motor 2 Behavior Layer determinations
 * - WORK_ORDER: Event originating from Motor 1 Work Order fulfillment
 */
export enum NetworkEventSourceKind {
  DISPATCH = 'DISPATCH',
  BEHAVIOR = 'BEHAVIOR',
  WORK_ORDER = 'WORK_ORDER',
}

/**
 * Network Event Type Enum
 *
 * Represents the semantic category of operational event in the network.
 *
 * Event Types:
 * - OUTCOME_GENERATED: Execution outcome produced
 * - BEHAVIOR_DETERMINED: Behavior determination made
 * - POLICY_APPLIED: Policy applied to situation
 * - ASSIGNMENT_CREATED: Resource assignment created
 * - ASSIGNMENT_MODIFIED: Resource assignment modified
 * - ASSIGNMENT_RELEASED: Resource assignment released
 * - AVAILABILITY_CHANGED: Resource availability changed
 * - CAPACITY_CHANGED: Resource capacity changed
 * - STATUS_CHANGED: Entity status changed
 * - ERROR_OCCURRED: Error or exception occurred
 * - WARNING_ISSUED: Warning condition occurred
 * - METRIC_RECORDED: Metric recorded for analysis
 */
export enum NetworkEventType {
  OUTCOME_GENERATED = 'OUTCOME_GENERATED',
  BEHAVIOR_DETERMINED = 'BEHAVIOR_DETERMINED',
  POLICY_APPLIED = 'POLICY_APPLIED',
  ASSIGNMENT_CREATED = 'ASSIGNMENT_CREATED',
  ASSIGNMENT_MODIFIED = 'ASSIGNMENT_MODIFIED',
  ASSIGNMENT_RELEASED = 'ASSIGNMENT_RELEASED',
  AVAILABILITY_CHANGED = 'AVAILABILITY_CHANGED',
  CAPACITY_CHANGED = 'CAPACITY_CHANGED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  ERROR_OCCURRED = 'ERROR_OCCURRED',
  WARNING_ISSUED = 'WARNING_ISSUED',
  METRIC_RECORDED = 'METRIC_RECORDED',
}

/**
 * Network Service Reference Type
 *
 * Deterministic reference to a service entity in the network.
 *
 * Immutable:
 * Service references are immutable once created.
 */
export interface NetworkServiceRef {
  /**
   * Service identifier
   * Explicit reference to service entity
   */
  serviceId: string;

  /**
   * Service name
   * Human-readable service identification
   */
  serviceName: string;

  /**
   * Service type classification
   * Category of service (delivery, maintenance, consultation, etc.)
   * String classification
   */
  serviceType: string;
}

/**
 * Network Part Reference Type
 *
 * Deterministic reference to a part or component in the network.
 *
 * Immutable:
 * Part references are immutable once created.
 */
export interface NetworkPartRef {
  /**
   * Part identifier
   * Explicit reference to part entity
   */
  partId: string;

  /**
   * Part SKU or code
   * Standardized identification
   */
  partCode: string;

  /**
   * Part name
   * Human-readable part identification
   */
  partName: string;
}

/**
 * Network Fleet Reference Type
 *
 * Deterministic reference to a fleet or vehicle group in the network.
 *
 * Immutable:
 * Fleet references are immutable once created.
 */
export interface NetworkFleetRef {
  /**
   * Fleet identifier
   * Explicit reference to fleet entity
   */
  fleetId: string;

  /**
   * Fleet name
   * Human-readable fleet identification
   */
  fleetName: string;

  /**
   * Fleet type classification
   * Category of fleet (delivery, support, specialized, etc.)
   * String classification
   */
  fleetType: string;
}

/**
 * Network Region Reference Type
 *
 * Deterministic reference to a geographic region in the network.
 *
 * Immutable:
 * Region references are immutable once created.
 */
export interface NetworkRegionRef {
  /**
   * Region identifier
   * Explicit reference to region entity
   */
  regionId: string;

  /**
   * Region name
   * Human-readable region identification
   */
  regionName: string;

  /**
   * Geographic area type
   * Classification of region (country, state, city, zone, etc.)
   * String classification
   */
  areaType: string;
}

/**
 * Network Source Reference Type
 *
 * Deterministic reference to the originating entity that triggered the event.
 *
 * Immutable:
 * Source references are immutable once created.
 */
export interface NetworkSourceRef {
  /**
   * Source entity identifier
   * Explicit reference to entity that produced the event
   */
  sourceId: string;

  /**
   * Source kind
   * What system or layer produced the event
   */
  sourceKind: NetworkEventSourceKind;

  /**
   * Source entity type
   * Classification of source entity (dispatch, behavior verdict, work order, etc.)
   * String classification
   */
  sourceEntityType: string;
}

/**
 * Network Related References Type
 *
 * Deterministic collection of references related to the network event.
 *
 * Immutable:
 * Related references are immutable once created.
 */
export interface NetworkRelatedRefs {
  /**
   * Service references related to event
   * Services involved or affected by the event
   * May be empty if event has no service context
   */
  services: NetworkServiceRef[];

  /**
   * Part references related to event
   * Parts involved or affected by the event
   * May be empty if event has no part context
   */
  parts: NetworkPartRef[];

  /**
   * Fleet references related to event
   * Fleets involved or affected by the event
   * May be empty if event has no fleet context
   */
  fleets: NetworkFleetRef[];

  /**
   * Region references related to event
   * Regions involved or affected by the event
   * May be empty if event has no region context
   */
  regions: NetworkRegionRef[];
}

/**
 * Network Raw Context Type
 *
 * Transport-only context data for network events.
 * Designed for data transport and readonly access without mutation.
 *
 * Immutable:
 * Raw context is immutable once created.
 *
 * Note:
 * This is transport-only data structure. Any interpretation,
 * transformation, or normalization is deferred to Layer 1 Phase 2+.
 */
export interface NetworkRawContext {
  /**
   * Raw event metadata
   * Unprocessed metadata from event source
   * Structure determined by originating system
   * Readonly access only
   */
  readonly metadata: Record<string, unknown>;

  /**
   * Raw event attributes
   * Unprocessed attributes from event source
   * Structure determined by originating system
   * Readonly access only
   */
  readonly attributes: Record<string, unknown>;

  /**
   * Raw event payload
   * Unprocessed payload from event source
   * Structure determined by originating system
   * Readonly access only
   */
  readonly payload: Record<string, unknown>;
}

/**
 * Network Event Type
 *
 * Represents a deterministic network event containing operational data
 * from Motor 2 (Dispatch Engine) and external ecosystem reference binding.
 *
 * Pure Domain Contract:
 * - No logic
 * - No transformation
 * - No calculation
 * - No normalization
 * - Transport-only structure
 * - Reference-based architecture
 *
 * Immutable:
 * Network events are immutable once created.
 */
export interface NetworkEvent {
  /**
   * Unique identifier for this network event
   * Explicitly provided from intake layer
   * No generation in contract
   */
  networkEventId: string;

  /**
   * Semantic event type
   * What category of event occurred
   * Must be one of NetworkEventType enum values
   */
  eventType: NetworkEventType;

  /**
   * Operational domain of this event
   * What network domain the event applies to
   * Must be one of NetworkDomain enum values
   */
  networkDomain: NetworkDomain;

  /**
   * Source reference
   * Which system and entity produced this event
   * Complete source identification
   */
  sourceRef: NetworkSourceRef;

  /**
   * Related entity references
   * Services, parts, fleets, regions involved in this event
   * May contain empty arrays if no related references exist
   */
  relatedRefs: NetworkRelatedRefs;

  /**
   * Event timestamp (milliseconds since epoch)
   * When the event occurred in source system
   * Explicitly provided - no Date.now() in contracts
   */
  eventTimestamp: number;

  /**
   * Raw, unprocessed context
   * Transport-only data from originating system
   * Readonly access for data transport
   * No interpretation or transformation at contract level
   */
  rawContext: Readonly<NetworkRawContext>;

  /**
   * Intake timestamp (milliseconds since epoch)
   * When event was received by Motor 3
   * Explicitly provided - no Date.now() in contracts
   */
  intakeTimestamp: number;
}
