/**
 * Signal threshold registry for threshold definitions
 */

import type { SignalThreshold } from '../domain/signal-threshold.types';
import { SignalSeverity, SignalPriority } from '../domain/signal.enums';

export const SIGNAL_THRESHOLDS: Record<string, SignalThreshold> = {
  CONFIDENCE_THRESHOLD: {
    thresholdId: 'CONFIDENCE_THRESHOLD',
    metric: 'confidence',
    operator: 'GTE',
    value: 0.7,
    severityImpact: SignalSeverity.MEDIUM,
    priorityImpact: SignalPriority.MEDIUM,
  },
  CRITICAL_SEVERITY_THRESHOLD: {
    thresholdId: 'CRITICAL_SEVERITY_THRESHOLD',
    metric: 'severity',
    operator: 'EQ',
    value: 'CRITICAL',
    severityImpact: SignalSeverity.CRITICAL,
    priorityImpact: SignalPriority.CRITICAL,
  },
  HIGH_SEVERITY_THRESHOLD: {
    thresholdId: 'HIGH_SEVERITY_THRESHOLD',
    metric: 'severity',
    operator: 'EQ',
    value: 'HIGH',
    severityImpact: SignalSeverity.HIGH,
    priorityImpact: SignalPriority.HIGH,
  },
  ENGINE_TEMPERATURE_THRESHOLD: {
    thresholdId: 'ENGINE_TEMPERATURE_THRESHOLD',
    metric: 'engine_temperature',
    operator: 'GT',
    value: 95,
    severityImpact: SignalSeverity.HIGH,
    priorityImpact: SignalPriority.HIGH,
  },
  BRAKE_PRESSURE_THRESHOLD: {
    thresholdId: 'BRAKE_PRESSURE_THRESHOLD',
    metric: 'brake_pressure',
    operator: 'LT',
    value: 50,
    severityImpact: SignalSeverity.CRITICAL,
    priorityImpact: SignalPriority.CRITICAL,
  },
  MILEAGE_SERVICE_THRESHOLD: {
    thresholdId: 'MILEAGE_SERVICE_THRESHOLD',
    metric: 'mileage',
    operator: 'GTE',
    value: 100000,
    severityImpact: SignalSeverity.MEDIUM,
    priorityImpact: SignalPriority.MEDIUM,
  },
};

export function getThresholdDefinition(
  thresholdId: string,
): SignalThreshold | undefined {
  return SIGNAL_THRESHOLDS[thresholdId];
}

export function getAllThresholds(): SignalThreshold[] {
  return Object.values(SIGNAL_THRESHOLDS);
}
