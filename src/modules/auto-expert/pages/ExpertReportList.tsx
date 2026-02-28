/**
 * ExpertReportList - Display list of inspection reports
 * Filterable by status, searchable by plate/vin
 */

import React, { useState, useEffect } from 'react';
import type { ExpertReport, ReportStatus } from '../types';
import { reportStore } from '../store';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadges } from '../components/RiskBadges';

type FilterStatus = 'All' | 'Draft' | 'Final';

interface ExpertReportListProps {
  onSelectReport: (reportId: string) => void;
  onBack?: () => void;
}

export function ExpertReportList({ onSelectReport, onBack }: ExpertReportListProps) {
  const [reports, setReports] = useState<ExpertReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Load reports on mount
  useEffect(() => {
    const loaded = reportStore.loadAll();
    setReports(loaded);
  }, []);

  // Apply filters and search
  const filtered = reports.filter(report => {
    // Filter by status
    if (filterStatus !== 'All' && report.status !== filterStatus) {
      return false;
    }

    // Filter by search (plate or vin)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        report.plate.toLowerCase().includes(query) ||
        report.vin.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Oto Ekspertiz Raporları
            </h1>
            <p className="text-gray-600">
              {reports.length} rapor | {filtered.length} gösteriliyor
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              ← Geri
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Arama (Plaka / VIN)
              </label>
              <input
                type="text"
                placeholder="34ABC0001 veya WF0U..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Durum
              </label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">Tümü</option>
                <option value="Draft">Taslak</option>
                <option value="Final">Kesinleştirildi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">
              {searchQuery || filterStatus !== 'All'
                ? 'Arama sonucu rapor bulunamadı.'
                : 'Henüz rapor yok.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Plaka
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    VIN
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Skor
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(report => (
                  <tr
                    key={report.id}
                    onClick={() => onSelectReport(report.id)}
                    className="hover:bg-blue-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {report.plate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.vin}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">
                      {report.score}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <RiskBadges flags={report.riskFlags} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={report.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
