import { DispatchEscalationLevel } from './dispatch-behavior.enums';

/**
 * Dispatch Escalation Notification Types
 *
 * Models the explicit notification preferences and delivery semantics for escalations.
 *
 * Purpose:
 * Escalation notifications define how escalated dispatches are communicated,
 * separate from escalation policy. Provides deterministic notification contracts.
 */

/**
 * Notification Channel Enum
 *
 * Categorizes available notification delivery channels.
 *
 * Channels:
 * - EMAIL: Email notification
 * - SMS: Short message service notification
 * - WEBHOOK: HTTP webhook notification
 * - IN_APP: In-application notification
 * - PHONE: Phone call notification
 * - PUSH: Push notification to mobile device
 * - CUSTOM: Custom notification channel
 */
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WEBHOOK = 'WEBHOOK',
  IN_APP = 'IN_APP',
  PHONE = 'PHONE',
  PUSH = 'PUSH',
  CUSTOM = 'CUSTOM',
}

/**
 * Notification Priority Enum
 *
 * Represents the priority/urgency level of a notification.
 *
 * Levels:
 * - LOW: Low priority notification
 * - NORMAL: Normal/standard notification
 * - HIGH: High priority notification
 * - CRITICAL: Critical/urgent notification
 */
export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Notification Channel Preference Type
 *
 * Represents preference for a specific notification channel.
 *
 * Immutable:
 * Channel preferences are immutable once created.
 */
export interface NotificationChannelPreference {
  /**
   * Unique identifier for this preference
   * Explicitly provided from notification configuration
   */
  preferenceId: string;

  /**
   * Notification channel
   * How the notification should be delivered
   */
  channel: NotificationChannel;

  /**
   * Delivery priority for this channel
   * 0 = first channel tried, 1 = fallback, etc.
   */
  deliveryPriority: number;

  /**
   * Channel-specific configuration
   * Parameters specific to this channel
   * Examples: email address, webhook URL, phone number, etc.
   */
  channelConfig: Record<string, unknown>;

  /**
   * Metadata contextual to this preference
   * Additional structured data
   */
  metadata: Record<string, unknown>;

  /**
   * Timestamp when this preference was created (milliseconds since epoch)
   * Explicitly provided from notification configuration layer
   */
  createdAt: number;

  /**
   * Timestamp when this preference was last updated (milliseconds since epoch)
   * Explicitly provided from notification configuration layer
   */
  updatedAt: number;
}

/**
 * Escalation Notification Template Type
 *
 * Represents the notification template and content for escalations.
 *
 * Immutable:
 * Notification templates are immutable once created.
 */
export interface EscalationNotificationTemplate {
  /**
   * Unique identifier for this notification template
   * Explicitly provided from notification template library
   */
  templateId: string;

  /**
   * Escalation level this template applies to
   * LOW, MEDIUM, HIGH, CRITICAL
   * Different templates for different severity levels
   */
  escalationLevel: DispatchEscalationLevel;

  /**
   * Notification subject/title
   * Title or subject line for the notification
   */
  subject: string;

  /**
   * Notification body/message
   * Main content of the notification
   */
  messageBody: string;

  /**
   * Notification priority
   * How urgent this notification is
   */
  priority: NotificationPriority;

  /**
   * Whether acknowledgment is required
   * true if recipient must acknowledge receipt
   */
  requiresAcknowledgment: boolean;

  /**
   * Timeout for acknowledgment (milliseconds)
   * How long to wait for acknowledgment before escalating further
   * null if no timeout
   */
  acknowledgmentTimeoutMs: number | null;

  /**
   * Template metadata and variables
   * Placeholders and dynamic data for template rendering
   */
  templateVariables: Record<string, unknown>;

  /**
   * Timestamp when this template was created (milliseconds since epoch)
   * Explicitly provided from notification template library
   */
  createdAt: number;

  /**
   * Timestamp when this template was last updated (milliseconds since epoch)
   * Explicitly provided from notification template library
   */
  updatedAt: number;
}

/**
 * Escalation Notification Specification Type
 *
 * Represents the complete notification strategy for an escalated dispatch.
 *
 * Immutable:
 * Notification specifications are immutable once created.
 */
export interface EscalationNotificationSpec {
  /**
   * Unique identifier for this notification specification
   * Explicitly provided from escalation notification layer
   */
  notificationSpecId: string;

  /**
   * The dispatch ID this notification applies to
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Notification channel preferences
   * Available channels and their delivery order
   */
  channelPreferences: readonly NotificationChannelPreference[];

  /**
   * Notification template for this escalation
   * Content and format to use
   */
  template: EscalationNotificationTemplate;

  /**
   * Retry count if notification delivery fails
   * Maximum number of delivery attempts
   */
  deliveryRetryCount: number;

  /**
   * Delay between retry attempts (milliseconds)
   * Explicit backoff between failed delivery attempts
   */
  retryDelayMs: number;

  /**
   * Timestamp when this specification was created (milliseconds since epoch)
   * Explicitly provided from escalation notification layer
   */
  createdAt: number;

  /**
   * Timestamp when this specification was last updated (milliseconds since epoch)
   * Explicitly provided from escalation notification layer
   */
  updatedAt: number;
}
