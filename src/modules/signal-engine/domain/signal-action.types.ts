/**
 * Signal recommended action structure
 */

export interface SignalAction {
  actionId: string;
  actionType: string;
  description: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedImpact?: string;
}
