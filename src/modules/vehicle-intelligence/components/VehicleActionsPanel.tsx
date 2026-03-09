/**
 * Vehicle Actions Panel
 * Phase 11.3: Display vehicle intelligence actions
 *
 * Design:
 * - READ-ONLY: Only reads from snapshot via accessor
 * - NO data generation: Displays pre-generated actions
 * - NO side effects: Pure UI component
 * - NO modifications: Actions are immutable
 *
 * Data source: snapshot.vehicleIntelligenceActions[]
 * Read via: snapshotAccessor.getVehicleIntelligenceActions()
 *
 * UI Features:
 * - Priority badges with Turkish labels
 * - Max 5 actions displayed
 * - Sorted by priority (high, medium, low)
 * - Shows actionType and group
 * - Empty state when no actions
 */

import React, { useMemo } from 'react';
import { AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { getVehicleIntelligenceActions } from '../../vehicle-state/snapshotAccessor';

interface VehicleAction {
  key: string;
  title: string;
  summary: string;
  actionType: string;
  priority: 'high' | 'medium' | 'low';
  sourceRecommendationKey?: string;
  group?: 'maintenance' | 'risk' | 'insurance' | 'data-quality';
}

interface VehicleActionsPanelProps {
  vehicleId: string;
}

/**
 * Priority badge component with Turkish labels
 */
function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const config = {
    high: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      badge: 'bg-red-600',
      label: 'YÜKSEKe',
    },
    medium: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      badge: 'bg-amber-600',
      label: 'ORTA',
    },
    low: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      badge: 'bg-blue-600',
      label: 'DÜŞÜK',
    },
  };

  const c = config[priority];
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.badge} mr-2`}></span>
      {c.label}
    </span>
  );
}

/**
 * Action type badge component
 */
function ActionTypeBadge({ actionType, group }: { actionType: string; group?: string }) {
  // Map action types to Turkish labels
  const actionTypeLabels: Record<string, string> = {
    SCHEDULE_MAINTENANCE: '🔧 Bakım Planla',
    INSPECT_MECHANICAL_SYSTEM: '🔍 Teknik Muayene',
    PRIORITIZE_SERVICE_APPOINTMENT: '📋 Servis Randevusu',
    REVIEW_INSURANCE_POLICY: '📄 Sigorta İnceleme',
    IMPROVE_DATA_QUALITY: '📊 Veri Kalitesi',
  };

  const label = actionTypeLabels[actionType] || actionType;

  return (
    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
      {label}
    </span>
  );
}

/**
 * Action card component
 */
function ActionCard({ action }: { action: VehicleAction }) {
  return (
    <div className="border border-gray-200 rounded-md p-4 hover:shadow-sm transition bg-white">
      <div className="flex items-start gap-3">
        {/* Priority Badge */}
        <div className="flex-shrink-0">
          <PriorityBadge priority={action.priority} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm md:text-base break-words">
            {action.title}
          </h4>
          <p className="text-gray-600 text-sm mt-1 break-words">{action.summary}</p>

          {/* Action type and group tags */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <ActionTypeBadge actionType={action.actionType} group={action.group} />
            {action.group && (
              <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                {action.group}
              </span>
            )}
          </div>
        </div>

        {/* Action indicator icon */}
        <div className="flex-shrink-0">
          <CheckCircle2 size={20} className="text-blue-500" />
        </div>
      </div>
    </div>
  );
}

/**
 * Vehicle Actions Panel
 * Displays generated actions for vehicle intelligence analysis
 * Phase 11.3: UI component for action display
 */
export function VehicleActionsPanel({ vehicleId }: VehicleActionsPanelProps) {
  // Get actions from snapshot via accessor
  const actions = getVehicleIntelligenceActions(vehicleId);

  // Sort actions by priority (high -> medium -> low)
  const sortedActions = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...actions].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }, [actions]);

  // Show max 5 actions
  const visibleActions = sortedActions.slice(0, 5);

  // Empty state
  if (!actions.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <Info size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800">⚡ İşlem Adımları</h3>
        </div>
        <p className="text-gray-500 text-sm">Bu araç için henüz işlem adımı önerilmemektedir.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mt-6">
      {/* Header with title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h3 className="text-lg font-semibold text-gray-800">İşlem Adımları</h3>
          </div>
          {actions.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {actions.length} toplam
            </span>
          )}
        </div>

        {actions.filter(a => a.priority === 'high').length > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-sm font-medium text-red-700">
              {actions.filter(a => a.priority === 'high').length} ACIL
            </span>
          </div>
        )}
      </div>

      {/* Actions Grid */}
      <div className="space-y-3">
        {visibleActions.map((action) => (
          <ActionCard key={action.key} action={action} />
        ))}
      </div>

      {/* "More" indicator */}
      {actions.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            +{actions.length - 5} daha fazla işlem adımı bulunmaktadır.
          </p>
        </div>
      )}
    </div>
  );
}
