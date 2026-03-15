import { DispatchPackageContentType } from './dispatch-package.enums';

/**
 * Dispatch Package Payload
 *
 * Represents the actual content/data being delivered in a dispatch package.
 * Payload is delivery-format agnostic and can be serialized differently based on contentType.
 */
export interface DispatchPackagePayload {
  /**
   * Format/structure of the payload content
   */
  contentType: DispatchPackageContentType;

  /**
   * Title of the dispatch package content
   */
  title: string;

  /**
   * Summary/description of the dispatch package content
   */
  summary: string;

  /**
   * Main body/content of the dispatch (format varies by contentType)
   */
  body: Record<string, unknown>;

  /**
   * Additional metadata associated with the payload
   */
  metadata: Record<string, unknown>;
}
