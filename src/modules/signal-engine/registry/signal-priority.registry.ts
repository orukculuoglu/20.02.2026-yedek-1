/**
 * Signal priority registry for severity-to-priority mapping
 */

import { SignalSeverity, SignalPriority } from '../domain/signal.enums';

export const SEVERITY_TO_PRIORITY_MAP: Record<SignalSeverity, SignalPriority> = {
  [SignalSeverity.LOW]: SignalPriority.LOW,
  [SignalSeverity.MEDIUM]: SignalPriority.MEDIUM,
  [SignalSeverity.HIGH]: SignalPriority.HIGH,
  [SignalSeverity.CRITICAL]: SignalPriority.CRITICAL,
};

export function getDefaultPriorityForSeverity(
  severity: SignalSeverity,
): SignalPriority {
  return SEVERITY_TO_PRIORITY_MAP[severity];
}
