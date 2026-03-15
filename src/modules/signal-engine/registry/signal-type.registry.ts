/**
 * Signal type registry for supported signal types
 */

import { SignalSeverity, SignalPriority, SignalCategory } from '../domain/signal.enums';

export interface SignalTypeDefinition {
  signalTypeName: string;
  category: SignalCategory;
  defaultSeverity: SignalSeverity;
  defaultPriority: SignalPriority;
}

export const SIGNAL_TYPE_DEFINITIONS: Record<string, SignalTypeDefinition> = {
  PREDICTIVE_MAINTENANCE_SIGNAL: {
    signalTypeName: 'PREDICTIVE_MAINTENANCE_SIGNAL',
    category: SignalCategory.PREDICTIVE_MAINTENANCE,
    defaultSeverity: SignalSeverity.MEDIUM,
    defaultPriority: SignalPriority.MEDIUM,
  },
  RISK_ESCALATION_SIGNAL: {
    signalTypeName: 'RISK_ESCALATION_SIGNAL',
    category: SignalCategory.RISK_ESCALATION,
    defaultSeverity: SignalSeverity.HIGH,
    defaultPriority: SignalPriority.HIGH,
  },
  INSURANCE_PRESSURE_SIGNAL: {
    signalTypeName: 'INSURANCE_PRESSURE_SIGNAL',
    category: SignalCategory.INSURANCE_PRESSURE,
    defaultSeverity: SignalSeverity.MEDIUM,
    defaultPriority: SignalPriority.MEDIUM,
  },
  SERVICE_URGENCY_SIGNAL: {
    signalTypeName: 'SERVICE_URGENCY_SIGNAL',
    category: SignalCategory.SERVICE_URGENCY,
    defaultSeverity: SignalSeverity.MEDIUM,
    defaultPriority: SignalPriority.MEDIUM,
  },
  DATA_QUALITY_SIGNAL: {
    signalTypeName: 'DATA_QUALITY_SIGNAL',
    category: SignalCategory.DATA_QUALITY,
    defaultSeverity: SignalSeverity.LOW,
    defaultPriority: SignalPriority.LOW,
  },
  ENGINE_ANOMALY_SIGNAL: {
    signalTypeName: 'ENGINE_ANOMALY_SIGNAL',
    category: SignalCategory.OPERATIONAL_ANOMALY,
    defaultSeverity: SignalSeverity.HIGH,
    defaultPriority: SignalPriority.HIGH,
  },
  BRAKE_RISK_SIGNAL: {
    signalTypeName: 'BRAKE_RISK_SIGNAL',
    category: SignalCategory.OPERATIONAL_ANOMALY,
    defaultSeverity: SignalSeverity.CRITICAL,
    defaultPriority: SignalPriority.CRITICAL,
  },
};

export function getSignalTypeDefinition(
  signalTypeName: string,
): SignalTypeDefinition | undefined {
  return SIGNAL_TYPE_DEFINITIONS[signalTypeName];
}

export function getAllSignalTypes(): string[] {
  return Object.keys(SIGNAL_TYPE_DEFINITIONS);
}
