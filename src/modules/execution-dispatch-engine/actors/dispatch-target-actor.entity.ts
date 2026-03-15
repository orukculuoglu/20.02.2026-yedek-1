import { DispatchActorType } from '../domain';
import { DispatchTargetActorStatus, DispatchTargetResolutionMode } from './dispatch-target-actor.enums';
import { DispatchTargetActor, DispatchTargetBinding } from './dispatch-target-actor.types';
import { DispatchTargetActorRefs } from './dispatch-target-actor-refs.types';
import { DispatchTargetActorCapability } from './dispatch-target-actor-capability.types';

/**
 * Input contract for creating a new DispatchTargetActor
 *
 * All timestamps and IDs must be explicitly provided from upstream/runtime boundaries.
 * No temporal calculations or clock access is performed.
 */
export interface CreateDispatchTargetActorInput {
  /**
   * Actor ID (explicitly provided, not generated)
   */
  actorId: string;

  /**
   * Type of actor
   */
  actorType: DispatchActorType;

  /**
   * Display name for the actor
   */
  displayName: string;

  /**
   * Legal name for official reference
   */
  legalName: string;

  /**
   * Regional location code
   */
  regionCode: string;

  /**
   * Country code (ISO 3166-1 alpha-2)
   */
  countryCode: string;

  /**
   * Capabilities this actor possesses
   */
  capabilities: DispatchTargetActorCapability[];

  /**
   * Cross-ecosystem references
   */
  refs: DispatchTargetActorRefs;

  /**
   * Timestamp of creation (explicitly provided from runtime)
   */
  createdAt: number;

  /**
   * Timestamp of last update (explicitly provided from runtime)
   */
  updatedAt: number;
}

/**
 * Input contract for updating a DispatchTargetActor's status
 */
export interface UpdateDispatchTargetActorStatusInput {
  /**
   * The actor to update
   */
  actor: DispatchTargetActor;

  /**
   * New status for the actor
   */
  newStatus: DispatchTargetActorStatus;

  /**
   * Timestamp of the update (explicitly provided from runtime)
   */
  updatedAt: number;
}

/**
 * Input contract for creating a new DispatchTargetBinding
 *
 * All timestamps and IDs must be explicitly provided.
 */
export interface CreateDispatchTargetBindingInput {
  /**
   * Binding ID (explicitly provided, not generated)
   */
  bindingId: string;

  /**
   * The dispatch intent being bound
   */
  dispatchId: string;

  /**
   * The target actor for this binding
   */
  actorId: string;

  /**
   * Type of the target actor
   */
  actorType: DispatchActorType;

  /**
   * Reason for this binding decision
   */
  bindingReason: string;

  /**
   * Timestamp of binding creation (explicitly provided from runtime)
   */
  createdAt: number;

  /**
   * Timestamp of last modification (explicitly provided from runtime)
   */
  updatedAt: number;
}

/**
 * Dispatch Target Actor Entity Factory
 *
 * Provides deterministic factory methods for creating and updating DispatchTargetActor instances.
 * All operations are purely functional with immutable returns and zero input mutations.
 */
export class DispatchTargetActorEntity {
  /**
   * Create a new DispatchTargetActor
   *
   * The actor is created with deterministic initial values:
   * status = ACTIVE and resolutionMode = DIRECT.
   *
   * Actor status can be updated through updateDispatchTargetActorStatus().
   *
   * Resolution mode remains fixed in this phase and may be expanded in later phases if required.
   *
   * @param input Creation input contract with explicit timestamps and IDs
   * @returns Fresh DispatchTargetActor instance
   */
  static createDispatchTargetActor(
    input: CreateDispatchTargetActorInput,
  ): DispatchTargetActor {
    return {
      actorId: input.actorId,
      actorType: input.actorType,
      actorStatus: DispatchTargetActorStatus.ACTIVE, // Always determined, never from input
      resolutionMode: DispatchTargetResolutionMode.DIRECT, // Always determined, never from input
      displayName: input.displayName,
      legalName: input.legalName,
      regionCode: input.regionCode,
      countryCode: input.countryCode,
      capabilities: input.capabilities,
      createdAt: input.createdAt, // Explicit, never Date.now()
      updatedAt: input.updatedAt, // Explicit, never Date.now()
      refs: input.refs,
    };
  }

  /**
   * Update an actor's status with deterministic immutability
   *
   * @param input Update input with new status and explicit timestamp
   * @returns Fresh DispatchTargetActor with updated status and timestamp
   */
  static updateDispatchTargetActorStatus(
    input: UpdateDispatchTargetActorStatusInput,
  ): DispatchTargetActor {
    return {
      ...input.actor, // Preserve all existing fields
      actorStatus: input.newStatus, // Update only status
      updatedAt: input.updatedAt, // Update only timestamp (explicit, never Date.now())
    };
  }
}

/**
 * Dispatch Target Binding Entity Factory
 *
 * Provides deterministic factory methods for creating DispatchTargetBinding instances.
 * All operations are purely functional with immutable returns and zero input mutations.
 */
export class DispatchTargetBindingEntity {
  /**
   * Create a new DispatchTargetBinding
   *
   * A binding represents a structural connection between a dispatch intent and a target actor.
   * All timestamps and IDs are explicitly provided from runtime boundaries.
   *
   * @param input Creation input contract with explicit timestamps and IDs
   * @returns Fresh DispatchTargetBinding instance
   */
  static createDispatchTargetBinding(
    input: CreateDispatchTargetBindingInput,
  ): DispatchTargetBinding {
    return {
      bindingId: input.bindingId,
      dispatchId: input.dispatchId,
      actorId: input.actorId,
      actorType: input.actorType,
      bindingReason: input.bindingReason,
      createdAt: input.createdAt, // Explicit, never Date.now()
      updatedAt: input.updatedAt, // Explicit, never Date.now()
    };
  }
}
