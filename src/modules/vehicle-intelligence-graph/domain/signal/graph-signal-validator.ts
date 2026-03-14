import { GraphSignal } from './graph-signal';

export function isValidGraphSignal(signal: GraphSignal): boolean {
  // Check required IDs
  if (!signal.signalId) {
    return false;
  }
  if (!signal.vehicleId) {
    return false;
  }

  // Check required signal characteristics
  if (!signal.severity) {
    return false;
  }
  if (typeof signal.confidence !== 'number' || signal.confidence < 0 || signal.confidence > 1) {
    return false;
  }

  // Check required explanation
  if (!signal.explanation) {
    return false;
  }

  // Check timestamp
  if (!signal.generatedAt) {
    return false;
  }

  return true;
}
