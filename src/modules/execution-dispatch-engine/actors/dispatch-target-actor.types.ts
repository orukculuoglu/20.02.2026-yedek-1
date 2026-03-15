import { DispatchActorType } from '../domain';
import { DispatchTargetActorStatus, DispatchTargetResolutionMode } from './dispatch-target-actor.enums';
import { DispatchTargetActorRefs } from './dispatch-target-actor-refs.types';
import { DispatchTargetActorCapability } from './dispatch-target-actor-capability.types';

/**
 * Dispatch Target Actor Entity
 *
 * Represents a target actor in the dispatch system that can receive and process dispatch intents.
 * This is the primary structural contract for any entity that serves as a dispatch target.
 *
 * A target actor is a concrete business entity (e.g., ERP system, service, fleet manager, insurance provider)
 * that has operational capacity and can be bound to specific dispatch intents for execution.
 */
export interface DispatchTargetActor {
  /**
   * Unique identifier for this actor within the dispatch system
   */
  actorId: string;

  /**
   * Type of actor (SERVICE, FLEET, INSPECTION, INSURANCE, ERP, SYSTEM)
   * Reuses the strict enum from the dispatch domain layer.
   */
  actorType: DispatchActorType;

  /**
   * Current operational status of this actor
   */
  actorStatus: DispatchTargetActorStatus;

  /**
   * How this actor can be selected for dispatch routing
   */
  resolutionMode: DispatchTargetResolutionMode;

  /**
   * Display name (human-readable identifier)
   */
  displayName: string;

  /**
   * Legal name (for compliance, contracts, and official records)
   */
  legalName: string;

  /**
   * Regional location code of the actor (e.g., 'TR', 'US', 'DE')
   */
  regionCode: string;

  /**
   * Country code of the actor's primary operational jurisdiction (ISO 3166-1 alpha-2)
   */
  countryCode: string;

  /**
   * List of capabilities this actor possesses and can use for dispatch handling
   */
  capabilities: DispatchTargetActorCapability[];

  /**
   * Timestamp when the actor was first registered in the system (milliseconds since epoch)
   */
  createdAt: number;

  /**
   * Timestamp when the actor was last modified (milliseconds since epoch)
   */
  updatedAt: number;

  /**
   * Cross-ecosystem references maintaining complete traceability
   */
  refs: DispatchTargetActorRefs;
}

/**
 * Dispatch Target Binding Entity
 *
 * Represents a deterministic structural binding between a dispatch intent and a target actor candidate.
 * This is the contract that formally connects an intent to a specific actor for execution.
 *
 * NOTE: This binding is a structural contract only, NOT a runtime resolution.
 * It captures the decision to bind an intent to an actor, but does not include
 * scoring, ranking, or selection logic.
 */
export interface DispatchTargetBinding {
  /**
   * Unique identifier for this binding relationship
   */
  bindingId: string;

  /**
   * The dispatch intent being bound to a target
   */
  dispatchId: string;

  /**
   * The actor that will receive this dispatch
   */
  actorId: string;

  /**
   * Type of the target actor (SERVICE, FLEET, INSPECTION, INSURANCE, ERP, SYSTEM)
   */
  actorType: DispatchActorType;

  /**
   * Structured reason documenting why this specific actor was selected for this dispatch
   * (e.g., 'CAPABILITY_MATCH', 'REGION_ALIGNMENT', 'MANUAL_ASSIGNMENT', 'SYSTEM_RULE')
   */
  bindingReason: string;

  /**
   * Timestamp when the binding was created (milliseconds since epoch)
   */
  createdAt: number;

  /**
   * Timestamp when the binding was last modified (milliseconds since epoch)
   */
  updatedAt: number;
}
