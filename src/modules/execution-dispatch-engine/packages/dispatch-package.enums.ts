/**
 * Dispatch Package Status Enum
 *
 * Defines the lifecycle state of a dispatch package during preparation and sealing.
 */
export enum DispatchPackageStatus {
  CREATED = 'CREATED',
  READY = 'READY',
  SEALED = 'SEALED',
  CANCELLED = 'CANCELLED',
}

/**
 * Dispatch Package Content Type Enum
 *
 * Defines the format/structure of the package payload content.
 */
export enum DispatchPackageContentType {
  JSON = 'JSON',
  STRUCTURED_INTERNAL = 'STRUCTURED_INTERNAL',
  MANUAL_DOCUMENT = 'MANUAL_DOCUMENT',
  QUEUE_MESSAGE = 'QUEUE_MESSAGE',
}
