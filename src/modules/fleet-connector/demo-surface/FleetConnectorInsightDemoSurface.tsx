/**
 * Fleet Connector Insight Demo Surface
 *
 * Read-only UI component that displays normalized fleet insight.
 *
 * This demo surface:
 * - Runs the deterministic normalization demo chain locally
 * - Derives multi-dimensional operational insight
 * - Displays aggregate summary in read-only format
 * - Never exposes raw external records
 * - Never calls external systems
 * - Never emits events
 * - Never performs mutations
 */

import React from 'react';

import { runFleetNormalizationDemo } from '../demo-normalization';
import { createFleetNormalizationInsightModel, FleetNormalizationInsightLevel } from '../insight-models';

/**
 * Static demo constants - caller-provided context
 *
 * All IDs and timestamps are static demo values provided at component level,
 * never generated internally.
 */
const DEMO_TENANT_ID = 'TENANT-DEMO-001';
const DEMO_FLEET_ID = 'FLEET-001';
const DEMO_NORMALIZED_AT = '2026-06-06T12:00:00Z';
const DEMO_NORMALIZED_RECORD_IDS = [
  'NORM-FLEET-DEMO-001',
  'NORM-FLEET-DEMO-002',
  'NORM-FLEET-DEMO-003',
  'NORM-FLEET-DEMO-004',
  'NORM-FLEET-DEMO-005',
];

/**
 * Helper: Translate insight level to Turkish display text
 */
function getLevelText(level: FleetNormalizationInsightLevel): string {
  switch (level) {
    case FleetNormalizationInsightLevel.Good:
      return 'İyi';
    case FleetNormalizationInsightLevel.Watch:
      return 'İzle';
    case FleetNormalizationInsightLevel.Warning:
      return 'Uyarı';
    case FleetNormalizationInsightLevel.Critical:
      return 'Kritik';
    case FleetNormalizationInsightLevel.Unknown:
      return 'Bilinmeyen';
    default:
      return level;
  }
}

/**
 * Helper: Get CSS class for insight level color coding
 */
function getLevelClassName(level: FleetNormalizationInsightLevel): string {
  switch (level) {
    case FleetNormalizationInsightLevel.Good:
      return 'insight-level-good';
    case FleetNormalizationInsightLevel.Watch:
      return 'insight-level-watch';
    case FleetNormalizationInsightLevel.Warning:
      return 'insight-level-warning';
    case FleetNormalizationInsightLevel.Critical:
      return 'insight-level-critical';
    case FleetNormalizationInsightLevel.Unknown:
      return 'insight-level-unknown';
    default:
      return '';
  }
}

/**
 * FleetConnectorInsightDemoSurface
 *
 * Read-only demo component that displays fleet normalization insight.
 *
 * Runs normalized data transformation pipeline deterministically and displays
 * multi-dimensional operational insight. Component is purely read-only with
 * no inputs, forms, or side effects.
 */
export function FleetConnectorInsightDemoSurface() {
  // Run the deterministic normalization demo chain
  const demoResult = runFleetNormalizationDemo({
    normalizedRecordIds: DEMO_NORMALIZED_RECORD_IDS,
    tenantId: DEMO_TENANT_ID,
    fleetId: DEMO_FLEET_ID,
    normalizedAt: DEMO_NORMALIZED_AT,
  });

  // Derive operational insight from the aggregate read model
  const insight = createFleetNormalizationInsightModel(demoResult.readModel);

  // Extract read model for easy reference
  const readModel = demoResult.readModel;

  return (
    <div className="fleet-connector-demo-surface">
      <div className="demo-section">
        <div className="demo-header">
          <h2>Filo Connector Demo İçgörüleri</h2>
          <p className="demo-subtitle">
            Dış sistemden gelen örnek filo kayıtlarının normalize edilmiş özet görünümü.
          </p>
        </div>

        {/* Batch Status Section */}
        <div className="demo-content">
          <div className="content-grid">
            {/* Left Column: Read Model Summary */}
            <div className="content-column">
              <h3>Normalizasyon Özeti</h3>

              <div className="metric-row">
                <span className="metric-label">Normalize Edilen Kayıt:</span>
                <span className="metric-value">{readModel.totalNormalizedRecords}</span>
              </div>

              <div className="metric-row">
                <span className="metric-label">Reddedilen Kayıt:</span>
                <span className="metric-value">{readModel.totalRejectedRecords}</span>
              </div>

              <div className="metric-row">
                <span className="metric-label">Eksik Bağlam Sayısı:</span>
                <span className="metric-value">{readModel.incompleteDescriptiveContextCount}</span>
              </div>

              <div className="metric-row">
                <span className="metric-label">Geçersiz Kilometre Sayısı:</span>
                <span className="metric-value">{readModel.invalidMileageCount}</span>
              </div>
            </div>

            {/* Right Column: Health Levels */}
            <div className="content-column">
              <h3>Sağlık Düzeyleri</h3>

              <div className={`metric-row level-display ${getLevelClassName(insight.overallHealth)}`}>
                <span className="metric-label">Genel Sağlık:</span>
                <span className="metric-value">{getLevelText(insight.overallHealth)}</span>
              </div>

              <div className={`metric-row level-display ${getLevelClassName(insight.dataQualityLevel)}`}>
                <span className="metric-label">Veri Kalitesi:</span>
                <span className="metric-value">{getLevelText(insight.dataQualityLevel)}</span>
              </div>

              <div className={`metric-row level-display ${getLevelClassName(insight.operationalAvailabilityLevel)}`}>
                <span className="metric-label">Operasyonel Uygunluk:</span>
                <span className="metric-value">{getLevelText(insight.operationalAvailabilityLevel)}</span>
              </div>

              <div className={`metric-row level-display ${getLevelClassName(insight.maintenancePressureLevel)}`}>
                <span className="metric-label">Bakım Baskısı:</span>
                <span className="metric-value">{getLevelText(insight.maintenancePressureLevel)}</span>
              </div>

              <div className={`metric-row level-display ${getLevelClassName(insight.rentalAvailabilityLevel)}`}>
                <span className="metric-label">Kiralama Uygunluğu:</span>
                <span className="metric-value">{getLevelText(insight.rentalAvailabilityLevel)}</span>
              </div>
            </div>
          </div>

          {/* Insights List */}
          {insight.insights.length > 0 && (
            <div className="insights-section">
              <h3>Operasyonel Bulgular</h3>
              <div className="insights-list">
                {insight.insights.map((item, index) => (
                  <div key={index} className={`insight-item ${getLevelClassName(item.level)}`}>
                    <span className="insight-code">{item.code}</span>
                    <span className="insight-level">{getLevelText(item.level)}</span>
                    <span className="insight-count">Sayı: {item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .fleet-connector-demo-surface {
          padding: 16px;
          background-color: #f5f5f5;
          border-radius: 4px;
          margin: 12px 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .demo-section {
          background-color: #ffffff;
          border-radius: 4px;
          padding: 16px;
          border-left: 4px solid #0066cc;
        }

        .demo-header {
          margin-bottom: 16px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 12px;
        }

        .demo-header h2 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .demo-subtitle {
          margin: 0;
          font-size: 13px;
          color: #666;
          font-style: italic;
        }

        .demo-content {
          margin-top: 12px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 16px;
        }

        .content-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .content-column h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background-color: #f9f9f9;
          border-radius: 2px;
          font-size: 13px;
        }

        .metric-label {
          font-weight: 500;
          color: #555;
        }

        .metric-value {
          font-weight: 600;
          color: #0066cc;
        }

        .level-display {
          background-color: transparent;
          border: 1px solid #d0d0d0;
          padding: 10px;
        }

        .level-display .metric-value {
          font-weight: 700;
          font-size: 14px;
        }

        .insight-level-good {
          border-left-color: #2da44e;
          background-color: #f1f8f4;
        }

        .insight-level-good .metric-value,
        .insight-level-good .insight-level {
          color: #2da44e;
        }

        .insight-level-watch {
          border-left-color: #9e6a03;
          background-color: #fffbec;
        }

        .insight-level-watch .metric-value,
        .insight-level-watch .insight-level {
          color: #9e6a03;
        }

        .insight-level-warning {
          border-left-color: #d1540f;
          background-color: #fff5f0;
        }

        .insight-level-warning .metric-value,
        .insight-level-warning .insight-level {
          color: #d1540f;
        }

        .insight-level-critical {
          border-left-color: #da3633;
          background-color: #fff0f1;
        }

        .insight-level-critical .metric-value,
        .insight-level-critical .insight-level {
          color: #da3633;
        }

        .insight-level-unknown {
          border-left-color: #8c959f;
          background-color: #f6f8fa;
        }

        .insight-level-unknown .metric-value,
        .insight-level-unknown .insight-level {
          color: #8c959f;
        }

        .insights-section {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #e0e0e0;
        }

        .insights-section h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .insight-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-radius: 3px;
          border-left: 3px solid #d0d0d0;
          background-color: #f9f9f9;
          font-size: 12px;
        }

        .insight-code {
          font-weight: 600;
          flex: 1;
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .insight-level {
          font-weight: 700;
          min-width: 60px;
        }

        .insight-count {
          color: #666;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .metric-row {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
