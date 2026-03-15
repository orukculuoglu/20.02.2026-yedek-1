import { DispatchPackageStatus } from './dispatch-package.enums';
import { DispatchPackagePayload } from './dispatch-package-payload.types';
import { DispatchPackageRefs } from './dispatch-package-refs.types';

/**
 * Dispatch Package Entity
 *
 * Represents a delivery-ready package that combines dispatch intent, target actor, and delivery channel
 * into a single unit prepared for transmission/execution.
 *
 * A package is the outbound contract that encapsulates all information needed to deliver
 * a dispatch to a specific actor through a specific channel.
 */
export interface DispatchPackage {
  /**
   * Unique identifier for this dispatch package
   */
  packageId: string;

  /**
   * The dispatch intent included in this package
   */
  dispatchId: string;

  /**
   * The target actor receiving this package
   */
  actorId: string;

  /**
   * The delivery channel for this package
   */
  channelId: string;

  /**
   * Current status of the package (CREATED, READY, SEALED, CANCELLED)
   */
  status: DispatchPackageStatus;

  /**
   * Delivery-ready payload with content and metadata
   */
  payload: DispatchPackagePayload;

  /**
   * Timestamp when the package was created (milliseconds since epoch)
   */
  createdAt: number;

  /**
   * Timestamp when the package was last modified (milliseconds since epoch)
   */
  updatedAt: number;

  /**
   * Full package-side and upstream traceability references
   */
  refs: DispatchPackageRefs;
}
