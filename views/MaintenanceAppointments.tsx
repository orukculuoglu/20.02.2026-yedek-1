import React, { useState, useEffect } from 'react';
import { getAppointments, acceptAppointment, setContext, getWorkOrder } from '../services/fleetRentalService';
import type { ServiceAppointment, WorkOrder } from '../types/fleetRental';
import type { ServiceWorkOrder, OperationalDetails } from '../types';
import { ViewState } from '../types';
import { createServiceWorkOrder } from '../services/dataService';
import { getCurrentUserSecurity } from '../services/securityService';

interface MaintenanceAppointmentsProps {
  onNavigate?: (view: string, id?: string) => void;
}

export default function MaintenanceAppointments({ onNavigate }: MaintenanceAppointmentsProps) {
  const [appointments, setAppointments] = useState<ServiceAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [statusFilter, setStatusFilter] = useState<string>(''); // Empty = default (Scheduled+Arrived)
  const [role, setRole] = useState<'admin' | 'ops' | 'viewer'>('ops');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  const currentUser = getCurrentUserSecurity();

  // Set module context on mount
  useEffect(() => {
    setContext('FLEET-001', role);
  }, [role]);

  // Load appointments on mount and filter change
  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

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

  // V2.6 - Transform WorkOrder to ServiceWorkOrder for Kanban cache
  const transformToServiceWorkOrder = (workOrder: WorkOrder, appointment: ServiceAppointment): ServiceWorkOrder => {
    const operationalDetails: OperationalDetails = {
      customerName: appointment.source === 'FleetRental' ? 'Filo Müşteri' : 'Kalıcı Müşteri',
      customerPhone: '',
      plate: appointment.plateNumber,
      mileage: 0,
      consentStatus: 'GRANTED',
      internalNotes: `Randevudan oluşturuldu: ${appointment.appointmentId}`,
      vinLast4: appointment.vin?.slice(-4),
    };

    return {
      id: workOrder.workOrderId,
      sourceEventId: `APT-${appointment.appointmentId}`,
      operationalHash: `OP-${Math.random().toString(36).substring(7).toUpperCase()}`,
      status: 'INTAKE_PENDING', // V2.6 - Shows in first Kanban column
      intakeChecklist: [{ id: 'c1', label: 'Araç Kabul', checked: true }],
      diagnosisItems: [],
      operationalDetails,
      customerName: operationalDetails.customerName,
      createdAt: workOrder.createdAt,
      updatedAt: new Date().toISOString(),
      erpState: 'PENDING',
    };
  };

  const handleAcceptAppointment = async (appointment: ServiceAppointment) => {
    if (role === 'viewer') {
      setError('Viewer rolü appointment kabul edemez');
      return;
    }

    setAccepting(appointment.appointmentId);
    try {
      const result = await acceptAppointment(appointment.appointmentId);
      
      setToast({ show: true, message: 'İş emri açıldı ✓' });

      // Remove from list
      setAppointments(prev => prev.filter(apt => apt.appointmentId !== appointment.appointmentId));
      
      // Load and show work order
      if (result.workOrderId) {
        const workOrder = await getWorkOrder(result.workOrderId);
        setSelectedWorkOrder(workOrder);
        setShowWorkOrderModal(true);

        // V2.6 - Transform to ServiceWorkOrder and cache in dataService (for Kanban visibility)
        const serviceWorkOrder = transformToServiceWorkOrder(workOrder, appointment);
        await createServiceWorkOrder(currentUser.institutionId, serviceWorkOrder);
      }

      // Auto-navigate to İş Emirleri after modal closes
      setTimeout(() => {
        setToast({ show: false, message: '' });
        if (onNavigate) {
          onNavigate(ViewState.REPAIR_SHOPS);
        }
      }, 3500);
    } catch (err) {
      setError(`Araç kabul başarısız: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
    } finally {
      setAccepting(null);
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
    <div className="p-6 space-y-4 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">
            <span className="font-semibold">Bakım Merkezi</span> • <span>Randevular</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Randevular</h1>
          <p className="text-gray-600 mt-1">Servis randevularını yönetin ve araçları kabul edin</p>
        </div>
        <div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'ops' | 'viewer')}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
          >
            <option value="admin">Admin</option>
            <option value="ops">Ops</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-4 text-red-600 hover:text-red-800 font-semibold text-xs"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            statusFilter === ''
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Tümü (Scheduled+Arrived)
        </button>
        <button
          onClick={() => setStatusFilter('Scheduled')}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            statusFilter === 'Scheduled'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Planlanmış
        </button>
        <button
          onClick={() => setStatusFilter('Arrived')}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            statusFilter === 'Arrived'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Vardı
        </button>
        <button
          onClick={() => setStatusFilter('Accepted')}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            statusFilter === 'Accepted'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Kabul Edildi
        </button>
        <button
          onClick={() => setStatusFilter('Cancelled')}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            statusFilter === 'Cancelled'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          İptal
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2">Yükleniyor...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && appointments.length === 0 && (
        <div className="text-center py-12 bg-white rounded border border-gray-200">
          <p className="text-gray-500 text-lg">Randevu bulunamadı</p>
          <button
            onClick={loadAppointments}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
          >
            Yenile
          </button>
        </div>
      )}

      {/* Appointments Table */}
      {!loading && appointments.length > 0 && (
        <div className="overflow-x-auto bg-white rounded border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Zaman</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Kaynak</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tip</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Araç (Plaka)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Servis Noktası</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Durum</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.map((apt) => (
                <tr key={apt.appointmentId} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-xs text-gray-700 whitespace-nowrap">
                    {new Date(apt.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceBadgeColor(apt.source)}`}>
                      {apt.source === 'FleetRental' && '🚗 Filo Kiralama'}
                      {apt.source === 'Individual' && '👤 Bireysel'}
                      {apt.source === 'Dealer' && '🏪 Galeri'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(apt.appointmentType)}`}>
                      {apt.appointmentType === 'Breakdown' ? '⚠️ Arıza' : '🔧 Bakım'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-700">
                    <div className="font-medium">{apt.plateNumber}</div>
                    <div className="text-gray-500 text-[10px]">{apt.vin}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-700">
                    <div className="font-medium">{apt.servicePointName}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(apt.status)}`}>
                      {apt.status === 'Scheduled' ? 'Planlanmış' :
                       apt.status === 'Arrived' ? 'Vardı' :
                       apt.status === 'Accepted' ? 'Kabul' : apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {role !== 'viewer' && apt.status !== 'Accepted' && (
                      <button
                        onClick={() => handleAcceptAppointment(apt)}
                        disabled={accepting === apt.appointmentId}
                        className="px-4 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {accepting === apt.appointmentId ? '...' : '✓ Araç Kabul'}
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
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 font-medium">
          {toast.message}
        </div>
      )}

      {/* WorkOrder Detail Modal */}
      {showWorkOrderModal && selectedWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">İş Emri: {selectedWorkOrder.workOrderId}</h2>
              <button
                onClick={() => setShowWorkOrderModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* V2.6 - Origin Display */}
            {selectedWorkOrder.origin && (
              <div className="mb-4 bg-blue-50 p-4 rounded border border-blue-200">
                <h3 className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-3">Kaynak Bilgisi</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-blue-700 font-semibold">Kaynak:</div>
                    <div className="font-bold text-blue-900 mt-1">
                      {selectedWorkOrder.origin.channel === 'FleetRental' && '🚗 Filo Kiralama'}
                      {selectedWorkOrder.origin.channel === 'Individual' && '👤 Bireysel'}
                      {selectedWorkOrder.origin.channel === 'Dealer' && '🏪 Galeri'}
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-700 font-semibold">Geliş Modu:</div>
                    <div className="font-bold text-blue-900 mt-1">
                      {selectedWorkOrder.origin.arrivalMode === 'Appointment' && '📅 Randevu'}
                      {selectedWorkOrder.origin.arrivalMode === 'WalkIn' && '🚶 Alışveriş'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Line Items */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Kalemler</h3>
              <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                {selectedWorkOrder.lineItems && selectedWorkOrder.lineItems.length > 0 ? (
                  <div className="space-y-2">
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
                  <div className="text-xs text-gray-500">Kalem yok</div>
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
