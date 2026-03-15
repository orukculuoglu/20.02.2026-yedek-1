import { DispatchPackageStatus } from './dispatch-package.enums';
import { DispatchPackage } from './dispatch-package.types';
import { DispatchPackagePayload } from './dispatch-package-payload.types';
import { DispatchPackageRefs } from './dispatch-package-refs.types';

/**
 * Input contract for creating a new DispatchPackage
 *
 * All timestamps and IDs must be explicitly provided from upstream/runtime boundaries.
 * No temporal calculations or clock access is performed.
 */
export interface CreateDispatchPackageInput {
  /**
   * Package ID (explicitly provided, not generated)
   */
  packageId: string;

  /**
   * The dispatch intent ID
   */
  dispatchId: string;

  /**
   * The target actor ID
   */
  actorId: string;

  /**
   * The delivery channel ID
   */
  channelId: string;

  /**
   * Delivery-ready payload
   */
  payload: DispatchPackagePayload;

  /**
   * Full traceability references
   */
  refs: DispatchPackageRefs;

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
 * Input contract for updating a DispatchPackage's status
 */
export interface UpdateDispatchPackageStatusInput {
  /**
   * The package to update
   */
  package: DispatchPackage;

  /**
   * New status for the package
   */
  newStatus: DispatchPackageStatus;

  /**
   * Timestamp of the update (explicitly provided from runtime)
   */
  updatedAt: number;
}

/**
 * Dispatch Package Entity Factory
 *
 * Provides deterministic factory methods for creating and updating DispatchPackage instances.
 * All operations are purely functional with immutable returns and zero input mutations.
 */
export class DispatchPackageEntity {
  /**
   * Create a new DispatchPackage
   *
   * The package is created with deterministic initial status CREATED.
   * Package status can be updated through updateDispatchPackageStatus().
   *
   * @param input Creation input contract with explicit timestamps and IDs
   * @returns Fresh DispatchPackage instance
   */
  static createDispatchPackage(
    input: CreateDispatchPackageInput,
  ): DispatchPackage {
    return {
      packageId: input.packageId,
      dispatchId: input.dispatchId,
      actorId: input.actorId,
      channelId: input.channelId,
      status: DispatchPackageStatus.CREATED, // Always determined, never from input
      payload: input.payload,
      createdAt: input.createdAt, // Explicit, never Date.now()
      updatedAt: input.updatedAt, // Explicit, never Date.now()
      refs: input.refs,
    };
  }

  /**
   * Update a package's status with deterministic immutability
   *
   * @param input Update input with new status and explicit timestamp
   * @returns Fresh DispatchPackage with updated status and timestamp
   */
  static updateDispatchPackageStatus(
    input: UpdateDispatchPackageStatusInput,
  ): DispatchPackage {
    return {
      ...input.package, // Preserve all existing fields
      status: input.newStatus, // Update only status
      updatedAt: input.updatedAt, // Update only timestamp (explicit, never Date.now())
    };
  }
}
