/**
 * Auto Expert Module - Main Container Component
 * Manages navigation between dashboard, list and detail views using local state
 * (No React Router dependency - compatible with admin panel's ViewState system)
 */

import React, { useEffect } from 'react';
import { OtoEkspertizDashboard } from './pages/OtoEkspertizDashboard';
import { ExpertReportList } from './pages/ExpertReportList';
import { ExpertReportDetail } from './pages/ExpertReportDetail';
import { VehicleIntelligencePanel } from './pages/VehicleIntelligencePanel';
import { reportStore } from './store';
import { auditStore } from './audit';
import { vehicleStore } from './vehicle/vehicleStore';

type OtoEkspertizView = 'dashboard' | 'list' | 'detail' | 'vehicle-intelligence';

interface AutoExpertContainerProps {
  selectedReportId?: string | null;
}

/**
 * Auto Expert Boot Component
 * Initializes seed data on first run
 */
export function AutoExpertBoot() {
  useEffect(() => {
    try {
      console.log('[AutoExpertBoot] Starting initialization...');

      // Ensure reports are seeded
      const allReports = reportStore.loadAll();
      console.log('[AutoExpertBoot] ✓ Reports loaded/seeded:', allReports.length);

      // Audit log for each report (only if new)
      const existingLogs = auditStore.loadAll();
      const auditedIds = new Set(existingLogs.map(l => l.reportId));

      for (const report of allReports) {
        if (!auditedIds.has(report.id)) {
          auditStore.append({
            reportId: report.id,
            action: 'CREATE',
            actorId: 'system',
          });
        }
      }

      console.log('[AutoExpertBoot] ✓ Audit logs created for new reports');

      // Always ensure vehicles are seeded from reports
      const allVehicles = vehicleStore.loadAll();
      console.log('[AutoExpertBoot] ✓ Vehicle store initialized:', allVehicles.length);

      console.log('[AutoExpertBoot] ✓ Initialization complete - ready for dashboard');
    } catch (err) {
      console.error('[AutoExpertBoot] Initialization error:', err);
    }
  }, []);

  return null;
}

/**
 * Auto Expert Container - Main component that manages dashboard/list/detail navigation
 */
export function AutoExpertContainer({ selectedReportId }: AutoExpertContainerProps) {
  const [currentView, setCurrentView] = React.useState<OtoEkspertizView>('dashboard');
  const [detailReportId, setDetailReportId] = React.useState<string | null>(
    selectedReportId || null
  );

  // Debug logging
  React.useEffect(() => {
    console.log('[AutoExpertContainer] ✓ Mounted, currentView:', currentView);
  }, []);

  React.useEffect(() => {
    console.log('[AutoExpertContainer] View changed to:', currentView);
  }, [currentView]);

  const handleViewDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleViewReports = () => {
    setCurrentView('list');
  };

  const handleViewDetail = (reportId: string) => {
    setDetailReportId(reportId);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setDetailReportId(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setDetailReportId(null);
  };

  const handleViewVehicleIntelligence = () => {
    setCurrentView('vehicle-intelligence');
  };

  return (
    <>
      <AutoExpertBoot />
      
      {/* DEBUG: Show which view is rendering */}
      <div style={{
        position: 'fixed',
        top: 80,
        right: 20,
        background: '#FFE5E5',
        border: '2px solid #FF0000',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#8B0000',
        zIndex: 999,
        maxWidth: '250px'
      }}>
        [Container] View: <strong>{currentView}</strong>
      </div>

      {currentView === 'dashboard' && (
        <OtoEkspertizDashboard
          onViewReports={handleViewReports}
          onViewDetail={handleViewDetail}
          onViewVehicleIntelligence={handleViewVehicleIntelligence}
        />
      )}
      {currentView === 'list' && (
        <ExpertReportList
          onSelectReport={handleViewDetail}
          onBack={handleBackToDashboard}
        />
      )}
      {currentView === 'detail' && (
        <ExpertReportDetail
          reportId={detailReportId!}
          onBack={handleBackToList}
        />
      )}
      {currentView === 'vehicle-intelligence' && (
        <VehicleIntelligencePanel
          onBack={handleBackToDashboard}
        />
      )}
    </>
  );
}

/**
 * Legacy export for module initialization
 */
export function AutoExpertRoutes() {
  return <AutoExpertContainer />;
}

/**
 * Export route configuration for documentation/reference
 */
export const autoExpertRoutes = [
  {
    path: '/oto-ekspertiz',
    element: <AutoExpertContainer />,
    label: 'Oto Ekspertiz',
  },
];

