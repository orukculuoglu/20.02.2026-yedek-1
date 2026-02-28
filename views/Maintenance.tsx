import React, { useState, useEffect } from 'react';
import { getAppointments, acceptAppointment, setContext, getWorkOrder, getContext } from '../services/fleetRentalService';
import type { ServiceAppointment, Fleet, WorkOrder } from '../types/fleetRental';

interface MaintenanceProps {
  fleets: Fleet[];
  selectedFleet: Fleet | null;
  onWorkOrderCreated?: (workOrderId: string) => void;
  onNavigateToWorkOrder?: (workOrderId: string) => void;
}

export default function Maintenance({ fleets, selectedFleet, onWorkOrderCreated, onNavigateToWorkOrder }: MaintenanceProps) {
  const [appointments, setAppointments] = useState<ServiceAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [statusFilter, setStatusFilter] = useState<string>(''); // Empty = default (Scheduled+Arrived)
  const [role, setRole] = useState<'admin' | 'ops' | 'viewer'>('ops');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);

  // Update service context when fleet changes
  useEffect(() => {
    if (selectedFleet) {
      setContext(selectedFleet.fleetId, role);
    }
  }, [selectedFleet, role]);

  // Load appointments
  useEffect(() => {
    if (!selectedFleet) return;

    const loadAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAppointments(statusFilter || undefined);
        setAppointments(data.appointments || []);
      } catch (err) {
        setError(`Randevuları yükleyemedi: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [selectedFleet, statusFilter]);

  const handleAcceptAppointment = async (appointment: ServiceAppointment) => {
    try {
      const result = await acceptAppointment(appointment.appointmentId);
      
      setToast({ show: true, message: 'İş emri açıldı' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);

      // Remove from list or refresh
      setAppointments(prev => prev.filter(apt => apt.appointmentId !== appointment.appointmentId));
      
      // Load and show work order
      if (result.workOrderId) {
        const workOrder = await getWorkOrder(result.workOrderId);
        setSelectedWorkOrder(workOrder);
        setShowWorkOrderModal(true);
        
        // Notify parent callbacks
        if (onWorkOrderCreated) onWorkOrderCreated(result.workOrderId);
        if (onNavigateToWorkOrder) onNavigateToWorkOrder(result.workOrderId);
      }
    } catch (err) {
      setError(`Araç kabul başarısız: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'FleetRental': return 'bg-blue-100 text-blue-800';
      case 'Individual': return 'bg-green-100 text-green-800';
      case 'Dealer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Breakdown': return 'bg-orange-100 text-orange-800';
      case 'Routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'Arrived': return 'bg-blue-100 text-blue-800';
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📋 Randevular</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            statusFilter === ''
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tümü (Scheduled+Arrived)
        </button>
        <button
          onClick={() => setStatusFilter('Scheduled')}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            statusFilter === 'Scheduled'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Planlanmış
        </button>
        <button
          onClick={() => setStatusFilter('Arrived')}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            statusFilter === 'Arrived'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Vardı
        </button>
        <button
          onClick={() => setStatusFilter('Accepted')}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            statusFilter === 'Accepted'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Kabul
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Yükleniyor...
        </div>
      )}

      {/* Appointments Table */}
      {!loading && appointments.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded border border-gray-200">
          <p className="text-gray-500">Randevu bulunamadı</p>
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Zaman</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Kaynak</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Tip</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Araç (Plaka)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Servis Noktası</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Durum</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.map((apt) => (
                <tr key={apt.appointmentId} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {new Date(apt.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceBadgeColor(apt.source)}`}>
                      {apt.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(apt.appointmentType)}`}>
                      {apt.appointmentType === 'Breakdown' ? '⚠️ Arıza' : '🔧 Bakım'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    <div>{apt.plateNumber}</div>
                    <div className="text-gray-500">{apt.vin}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    <div className="font-medium">{apt.servicePointName}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(apt.status)}`}>
                      {apt.status === 'Scheduled' ? 'Planlanmış' :
                       apt.status === 'Arrived' ? 'Vardı' :
                       apt.status === 'Accepted' ? 'Kabul' : apt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {role !== 'viewer' && apt.status !== 'Accepted' && (
                      <button
                        onClick={() => handleAcceptAppointment(apt)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition"
                      >
                        ✓ Araç Kabul
                      </button>
                    )}
                    {apt.status === 'Accepted' && (
                      <span className="text-gray-500 text-xs">Kabul edildi</span>
                    )}
                    {role === 'viewer' && (
                      <span className="text-gray-500 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast.message}
        </div>
      )}

      {/* WorkOrder Detail Modal (V2.6) */}
      {showWorkOrderModal && selectedWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">İş Emri: {selectedWorkOrder.workOrderId}</h2>
              <button
                onClick={() => setShowWorkOrderModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            {/* V2.6 - Origin Display */}
            {selectedWorkOrder.origin && (
              <div className="mb-4 bg-blue-50 p-3 rounded border border-blue-200">
                <h3 className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-2">Kaynak Bilgisi</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-blue-700">Kaynak:</span>
                    <div className="font-bold text-blue-900">
                      {selectedWorkOrder.origin.channel === 'FleetRental' && '🚗 Filo Kiralama'}
                      {selectedWorkOrder.origin.channel === 'Individual' && '👤 Bireysel'}
                      {selectedWorkOrder.origin.channel === 'Dealer' && '🏪 Galeri'}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700">Geliş Modu:</span>
                    <div className="font-bold text-blue-900">
                      {selectedWorkOrder.origin.arrivalMode === 'Appointment' && '📅 Randevu'}
                      {selectedWorkOrder.origin.arrivalMode === 'WalkIn' && '🚶 Alışveriş'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Line Items */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Kalemler</h3>
              <div className="bg-gray-50 p-2 rounded max-h-40 overflow-y-auto">
                {selectedWorkOrder.lineItems && selectedWorkOrder.lineItems.length > 0 ? (
                  <div className="space-y-1">
                    {selectedWorkOrder.lineItems.map((item) => (
                      <div key={item.lineId} className="text-xs bg-white p-2 rounded border border-gray-200">
                        <div className="font-medium">{item.description}</div>
                        <div className="text-gray-600">
                          {item.qty} x {item.unitPrice} {item.currency} = {(item.qty * item.unitPrice).toFixed(2)} {item.currency}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 p-2">Kalem yok</div>
                )}
              </div>
            </div>

            {/* Total Amount */}
            <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Toplam Tutar:</span>
                <span className="text-sm font-bold">{(selectedWorkOrder.totalAmount || 0).toFixed(2)} {selectedWorkOrder.currency || 'TRY'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Durum:</span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  selectedWorkOrder.status === 'Closed' ? 'bg-green-100 text-green-800' :
                  selectedWorkOrder.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedWorkOrder.status === 'Open' ? 'Açık' :
                   selectedWorkOrder.status === 'InProgress' ? 'Devam Ediyor' :
                   'Kapalı'}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowWorkOrderModal(false)}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400 transition"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
